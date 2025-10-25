import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Drawer, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message, Statistic, Row, Col, Typography } from 'antd';
import { adminAPI, VehicleRow, PostOfficeRow } from '../../services/api';

const { Title } = Typography;

type QueryState = { page: number; limit: number; search: string; type?: string; status?: string };

const typeOptions = [
  { label: 'Xe tải', value: 'Truck' },
  { label: 'Xe van', value: 'Van' },
];

const statusOptions = [
  { label: 'Sẵn sàng', value: 'Available' },
  { label: 'Đang sử dụng', value: 'InUse' },
  { label: 'Bảo trì', value: 'Maintenance' },
];

const AdminVehicles: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<VehicleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<QueryState>({ page: 1, limit: 10, search: '' });
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleRow | null>(null);
  const [stats, setStats] = useState({ total: 0, available: 0, inUse: 0, maintenance: 0 });
  const [offices, setOffices] = useState<PostOfficeRow[]>([]);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listVehicles({ 
        page: query.page, 
        limit: query.limit, 
        search: query.search,
        type: query.type,
        status: query.status
      });
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }, [query.page, query.limit, query.search, query.type, query.status]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getVehicleStats();
      setStats(res.data);
    } catch (e: any) {
      console.error('Failed to fetch stats:', e);
    }
  }, []);

  const fetchOffices = useCallback(async () => {
    try {
      const res = await adminAPI.listPostOffices();
      setOffices(res.data);
    } catch (e: any) {
      console.error('Failed to fetch offices:', e);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    fetchStats();
    fetchOffices();
  }, [fetchData, fetchStats, fetchOffices]);

  const onViewDetails = (record: VehicleRow) => {
    setSelectedVehicle(record);
    setOpen(true);
  };

  const onEdit = useCallback((record: VehicleRow) => {
    setEditingVehicle(record);
    form.setFieldsValue({
      licensePlate: record.licensePlate,
      type: record.type,
      capacity: record.capacity,
      status: record.status,
      description: record.description,
      officeId: record.officeId
    });
    setModalOpen(true);
  }, [form]);

  const onAdd = useCallback(() => {
    setEditingVehicle(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const onDelete = useCallback(async (id: number) => {
    try {
      await adminAPI.deleteVehicle(id);
      message.success('Đã xóa');
      fetchData();
      fetchStats();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  }, [fetchData, fetchStats]);

  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      if (editingVehicle) {
        await adminAPI.updateVehicle(editingVehicle.id, values);
        message.success('Cập nhật phương tiện thành công');
      } else {
        await adminAPI.createVehicle(values);
        message.success('Thêm phương tiện thành công');
      }
      setModalOpen(false);
      fetchData();
      fetchStats();
    } catch (e: any) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || 'Thao tác thất bại');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Available: 'green',
      InUse: 'blue',
      Maintenance: 'orange',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      Available: 'Sẵn sàng',
      InUse: 'Đang sử dụng',
      Maintenance: 'Bảo trì',
    };
    return texts[status] || status;
  };

  const getTypeText = (type: string) => {
    const texts: Record<string, string> = {
      Truck: 'Xe tải',
      Van: 'Xe van',
    };
    return texts[type] || type;
  };

  const columns = useMemo(() => [
    { title: 'Biển số xe', dataIndex: 'licensePlate', render: (v: string) => v || '-' },
    { 
      title: 'Loại xe', 
      dataIndex: 'type', 
      render: (v: string) => getTypeText(v) || '-' 
    },
    { 
      title: 'Tải trọng', 
      dataIndex: 'capacity', 
      render: (v: number | undefined) => v != null ? `${v} kg` : '-' 
    },
    { 
      title: 'Bưu cục', 
      dataIndex: ['office', 'name'],
      render: (_: any, record: VehicleRow) => record?.office?.name || 'Chưa phân công'
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (v: string | undefined) => v ? <Tag color={getStatusColor(v)}>{getStatusText(v)}</Tag> : '-' 
    },
    { 
      title: 'Số chuyến', 
      render: (_: any, record: VehicleRow) => record?.shipments?.length || 0
    },
    {
      title: 'Thao tác',
      render: (_: any, record: VehicleRow) => (
        <Space>
          <Button size="small" onClick={() => onViewDetails(record)}>Xem</Button>
          <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa phương tiện này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [onDelete, onEdit]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1C3D90' }}>Quản lý phương tiện</Title>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Tổng phương tiện" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Sẵn sàng" value={stats.available} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Đang sử dụng" value={stats.inUse} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Bảo trì" value={stats.maintenance} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
      </Row>

      <Card 
        style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        extra={
        <Space>
          <Button 
            type="primary" 
            style={{ backgroundColor: '#1C3D90', borderColor: '#1C3D90' }}
            onClick={onAdd}
          >
            Thêm phương tiện
          </Button>
          <Input.Search allowClear placeholder="Tìm kiếm" onSearch={(v) => setQuery({ ...query, page: 1, search: v })} />
          <Select
            placeholder="Loại xe"
            allowClear
            style={{ width: 120 }}
            value={query.type}
            onChange={(v) => setQuery({ ...query, page: 1, type: v })}
          >
            {typeOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 120 }}
            value={query.status}
            onChange={(v) => setQuery({ ...query, page: 1, status: v })}
          >
            {statusOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
            ))}
          </Select>
        </Space>
      }>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns as any}
          dataSource={rows}
          pagination={{ current: query.page, pageSize: query.limit, total, onChange: (p, ps) => setQuery({ ...query, page: p, limit: ps }) }}
        />
      </Card>

      <Drawer
        title="Chi tiết phương tiện"
        placement="right"
        width={600}
        open={open}
        onClose={() => setOpen(false)}
      >
        {selectedVehicle && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Biển số xe">{selectedVehicle.licensePlate}</Descriptions.Item>
            <Descriptions.Item label="Loại xe">{getTypeText(selectedVehicle.type)}</Descriptions.Item>
            <Descriptions.Item label="Tải trọng">{selectedVehicle.capacity} kg</Descriptions.Item>
            <Descriptions.Item label="Bưu cục">{selectedVehicle.office?.name || 'Chưa phân công'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedVehicle.status)}>{getStatusText(selectedVehicle.status)}</Tag>
            </Descriptions.Item>
            {selectedVehicle.description && (
              <Descriptions.Item label="Mô tả">{selectedVehicle.description}</Descriptions.Item>
            )}
            <Descriptions.Item label="Số chuyến đã thực hiện">{selectedVehicle.shipments?.length || 0}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{new Date(selectedVehicle.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">{new Date(selectedVehicle.updatedAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title={editingVehicle ? "Cập nhật phương tiện" : "Thêm phương tiện mới"}
        open={modalOpen}
        onOk={submitForm}
        onCancel={() => setModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="licensePlate" label="Biển số xe" rules={[{ required: true, message: 'Vui lòng nhập biển số xe' }]}>
            <Input placeholder="Nhập biển số xe" />
          </Form.Item>
          <Form.Item name="type" label="Loại xe" rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}>
            <Select placeholder="Chọn loại xe">
              {typeOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="capacity" label="Tải trọng (kg)" rules={[{ required: true, message: 'Vui lòng nhập tải trọng' }]}>
            <Input type="number" placeholder="Nhập tải trọng" min={0} />
          </Form.Item>
          <Form.Item name="officeId" label="Bưu cục">
            <Select placeholder="Chọn bưu cục" allowClear>
              {offices.map(office => (
                <Select.Option key={office.id} value={office.id}>{office.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              {statusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả (tùy chọn)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminVehicles;

