import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Drawer, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminAPI, OrderRow } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

type QueryState = { page: number; limit: number; search: string; status?: string; postOfficeId?: string };

const statusOptions = [
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đã lấy hàng', value: 'picked_up' },
  { label: 'Đang vận chuyển', value: 'in_transit' },
  { label: 'Đã giao', value: 'delivered' },
  { label: 'Đã hủy', value: 'cancelled' },
];

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<QueryState>({ page: 1, limit: 10, search: '' });
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listOrders({ 
        page: query.page, 
        limit: query.limit, 
        search: query.search,
        status: query.status,
        postOfficeId: query.postOfficeId
      });
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }, [query.page, query.limit, query.search, query.status, query.postOfficeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onViewDetails = (record: OrderRow) => {
    setSelectedOrder(record);
    setOpen(true);
  };

  const onUpdateStatus = useCallback((record: OrderRow) => {
    setSelectedOrder(record);
    form.setFieldsValue({ status: record.status });
    setStatusModalOpen(true);
  }, [form]);

  const onDelete = useCallback(async (id: number) => {
    try {
      await adminAPI.deleteOrder(id);
      message.success('Đã xóa');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  }, [fetchData]);

  const submitStatusUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (selectedOrder) {
        await adminAPI.updateOrderStatus(selectedOrder.id, values.status);
        message.success('Cập nhật trạng thái thành công');
        setStatusModalOpen(false);
        fetchData();
      }
    } catch (e: any) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || 'Cập nhật thất bại');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      picked_up: 'cyan',
      in_transit: 'purple',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      picked_up: 'Đã lấy hàng',
      in_transit: 'Đang vận chuyển',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = useMemo(() => [
    { title: 'Mã vận đơn', dataIndex: 'trackingNumber', render: (v: string) => v || '-' },
    { title: 'Người gửi', dataIndex: 'senderName', render: (v: string) => v || '-' },
    { title: 'Người nhận', dataIndex: 'recipientName', render: (v: string) => v || '-' },
    { 
      title: 'Bưu cục', 
      dataIndex: ['postOffice', 'name'],
      render: (_: any, record: OrderRow) => record?.postOffice?.name || 'N/A'
    },
    { 
      title: 'Dịch vụ', 
      dataIndex: ['serviceType', 'name'],
      render: (_: any, record: OrderRow) => record?.serviceType?.name || 'N/A'
    },
    { 
      title: 'Tổng tiền', 
      dataIndex: 'totalAmount', 
      render: (v: number | undefined) => v != null ? `${v.toLocaleString()} VNĐ` : '-' 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (v: string | undefined) => v ? <Tag color={getStatusColor(v)}>{getStatusText(v)}</Tag> : '-' 
    },
    {
      title: 'Thao tác',
      render: (_: any, record: OrderRow) => (
        <Space>
          <Button size="small" onClick={() => onViewDetails(record)}>Xem</Button>
          <Button size="small" onClick={() => onUpdateStatus(record)}>Sửa trạng thái</Button>
          <Popconfirm title="Xóa đơn hàng này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [onDelete, onUpdateStatus]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1C3D90' }}>Quản lý đơn hàng</Title>
      </div>
      
      <Card 
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#1C3D90', borderColor: '#1C3D90' }}
              onClick={() => navigate('/admin/orders/create')}
            >
              Thêm đơn hàng
            </Button>
            <Input.Search allowClear placeholder="Tìm kiếm" onSearch={(v) => setQuery({ ...query, page: 1, search: v })} />
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 150 }}
              value={query.status}
              onChange={(v) => setQuery({ ...query, page: 1, status: v })}
            >
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns as any}
        dataSource={rows}
        pagination={{ current: query.page, pageSize: query.limit, total, onChange: (p, ps) => setQuery({ ...query, page: p, limit: ps }) }}
      />

      <Drawer
        title="Chi tiết đơn hàng"
        placement="right"
        width={600}
        open={open}
        onClose={() => setOpen(false)}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã vận đơn">{selectedOrder.trackingNumber}</Descriptions.Item>
            <Descriptions.Item label="Người gửi">{selectedOrder.senderName}</Descriptions.Item>
            <Descriptions.Item label="SĐT người gửi">{selectedOrder.senderPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ gửi">{selectedOrder.senderAddress}</Descriptions.Item>
            <Descriptions.Item label="Người nhận">{selectedOrder.recipientName}</Descriptions.Item>
            <Descriptions.Item label="SĐT người nhận">{selectedOrder.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ nhận">{selectedOrder.recipientAddress}</Descriptions.Item>
            <Descriptions.Item label="Trọng lượng">{selectedOrder.weight} kg</Descriptions.Item>
            <Descriptions.Item label="Bưu cục">{selectedOrder.postOffice?.name}</Descriptions.Item>
            <Descriptions.Item label="Dịch vụ">{selectedOrder.serviceType?.name}</Descriptions.Item>
            <Descriptions.Item label="Giá cơ bản">{selectedOrder.basePrice?.toLocaleString() || '0'} VNĐ</Descriptions.Item>
            <Descriptions.Item label="COD Amount">{selectedOrder.codAmount?.toLocaleString() || '0'} VNĐ</Descriptions.Item>
            <Descriptions.Item label="COD Fee">{selectedOrder.codFee?.toLocaleString() || '0'} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">{selectedOrder.totalAmount?.toLocaleString() || '0'} VNĐ</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Tag>
            </Descriptions.Item>
            {selectedOrder.notes && (
              <Descriptions.Item label="Ghi chú">{selectedOrder.notes}</Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={statusModalOpen}
        onOk={submitStatusUpdate}
        onCancel={() => setStatusModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
    </div>
  );
};

export default AdminOrders;
