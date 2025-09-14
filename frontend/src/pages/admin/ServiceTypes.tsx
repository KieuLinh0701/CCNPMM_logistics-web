import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message, InputNumber } from 'antd';
import { adminAPI, ServiceTypeRow } from '../../services/api';

type QueryState = { page: number; limit: number; search: string };

const AdminServiceTypes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ServiceTypeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<QueryState>({ page: 1, limit: 10, search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceTypeRow | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listServiceTypes({ page: query.page, limit: query.limit, search: query.search });
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [query.page, query.limit, query.search]);

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record: ServiceTypeRow) => {
    setEditing(record);
    setOpen(true);
  };

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        basePrice: editing.basePrice,
        codFee: editing.codFee,
        weightLimit: editing.weightLimit,
        deliveryTime: editing.deliveryTime,
        description: editing.description,
        status: editing.status,
      });
    }
  }, [editing, open, form]);

  const onDelete = async (id: number) => {
    try {
      await adminAPI.deleteServiceType(id);
      message.success('Đã xóa');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminAPI.updateServiceType(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await adminAPI.createServiceType(values);
        message.success('Tạo mới thành công');
      }
      setOpen(false);
      fetchData();
    } catch (e: any) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || 'Lưu thất bại');
      }
    }
  };

  const columns = useMemo(() => [
    { title: 'Tên dịch vụ', dataIndex: 'name' },
    { 
      title: 'Giá cơ bản', 
      dataIndex: 'basePrice', 
      render: (v: number) => `${v.toLocaleString()} VNĐ` 
    },
    { 
      title: 'COD Fee', 
      dataIndex: 'codFee', 
      render: (v: number) => `${v.toLocaleString()} VNĐ` 
    },
    { 
      title: 'Giới hạn trọng lượng', 
      dataIndex: 'weightLimit', 
      render: (v: number) => `${v} kg` 
    },
    { title: 'Thời gian giao', dataIndex: 'deliveryTime' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? 'Hoạt động' : 'Khóa'}</Tag> 
    },
    {
      title: 'Hành động',
      render: (_: any, record: ServiceTypeRow) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa loại dịch vụ này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], []);

  return (
    <Card title="Quản lý loại dịch vụ" extra={
      <Space>
        <Input.Search allowClear placeholder="Tìm kiếm" onSearch={(v) => setQuery({ ...query, page: 1, search: v })} />
        <Button type="primary" onClick={onCreate}>Thêm loại dịch vụ</Button>
      </Space>
    }>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns as any}
        dataSource={rows}
        pagination={{ current: query.page, pageSize: query.limit, total, onChange: (p, ps) => setQuery({ ...query, page: p, limit: ps }) }}
      />

      <Modal
        title={editing ? 'Cập nhật loại dịch vụ' : 'Tạo loại dịch vụ'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Tên dịch vụ" rules={[{ required: true }]}>
            <Input placeholder="VD: Tiêu chuẩn, Nhanh, Hỏa tốc" />
          </Form.Item>
          <Form.Item name="basePrice" label="Giá cơ bản (VNĐ)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="codFee" label="COD Fee (VNĐ)" rules={[{ required: true, type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
          <Form.Item name="weightLimit" label="Giới hạn trọng lượng (kg)" rules={[{ required: true, type: 'number', min: 0.1 }]}>
            <InputNumber style={{ width: '100%' }} placeholder="0" step={0.1} />
          </Form.Item>
          <Form.Item name="deliveryTime" label="Thời gian giao" rules={[{ required: true }]}>
            <Input placeholder="VD: 1-2 ngày, 3-5 ngày" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="active"> 
            <Select options={[{ label: 'Hoạt động', value: 'active' }, { label: 'Khóa', value: 'inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminServiceTypes;
