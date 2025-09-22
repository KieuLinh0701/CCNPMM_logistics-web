import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message, InputNumber } from 'antd';
import { adminAPI, PostOfficeRow } from '../../services/api';

type QueryState = { page: number; limit: number; search: string };

const AdminPostOffices: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PostOfficeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<QueryState>({ page: 1, limit: 10, search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PostOfficeRow | null>(null);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listPostOffices({ page: query.page, limit: query.limit, search: query.search });
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }, [query.page, query.limit, query.search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onEdit = (record: PostOfficeRow) => {
    setEditing(record);
    setOpen(true);
  };

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        code: editing.code,
        name: editing.name,
        address: editing.address,
        phoneNumber: editing.phoneNumber,
        email: editing.email,
        codeWard: editing.codeWard,
        codeCity: editing.codeCity,
        latitude: editing.latitude,
        longitude: editing.longitude,
        openingTime: editing.openingTime,
        closingTime: editing.closingTime,
        type: editing.type,
        status: editing.status,
      });
    }
  }, [editing, open, form]);

  const onDelete = useCallback(async (id: number) => {
    try {
      await adminAPI.deletePostOffice(id);
      message.success('Đã xóa');
      fetchData();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Xóa thất bại');
    }
  }, [fetchData]);

  const submit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminAPI.updatePostOffice(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await adminAPI.createPostOffice(values);
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
    { title: 'Mã bưu cục', dataIndex: 'code' },
    { title: 'Tên bưu cục', dataIndex: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', ellipsis: true },
    { title: 'Điện thoại', dataIndex: 'phoneNumber' },
    { title: 'Email', dataIndex: 'email' },
    { 
      title: 'Giờ làm việc', 
      render: (record: PostOfficeRow) => `${record.openingTime} - ${record.closingTime}` 
    },
    { 
      title: 'Loại', 
      dataIndex: 'type',
      render: (v: string) => <Tag color={v === 'Head Office' ? 'blue' : 'green'}>{v === 'Head Office' ? 'Trụ sở chính' : 'Bưu cục'}</Tag>
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (v: string) => <Tag color={v === 'Active' ? 'green' : v === 'Inactive' ? 'red' : 'orange'}>{v === 'Active' ? 'Hoạt động' : v === 'Inactive' ? 'Khóa' : 'Bảo trì'}</Tag> 
    },
    {
      title: 'Thao tác',
      render: (_: any, record: PostOfficeRow) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa bưu cục này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [onDelete]);

  return (
    <Card title="Quản lý bưu cục" extra={
      <Space>
        <Input.Search allowClear placeholder="Tìm kiếm" onSearch={(v) => setQuery({ ...query, page: 1, search: v })} />
        <Button type="primary" onClick={onCreate}>Thêm bưu cục</Button>
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
        title={editing ? 'Cập nhật bưu cục' : 'Tạo bưu cục'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="code" label="Mã bưu cục" rules={[{ required: true }]}>
            <Input placeholder="VD: PO001" />
          </Form.Item>
          <Form.Item name="name" label="Tên bưu cục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="codeWard" label="Mã phường/xã" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 1" />
          </Form.Item>
          <Form.Item name="codeCity" label="Mã thành phố" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 79" />
          </Form.Item>
          <Form.Item name="latitude" label="Vĩ độ" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} step={0.0000001} placeholder="VD: 10.8231" />
          </Form.Item>
          <Form.Item name="longitude" label="Kinh độ" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} step={0.0000001} placeholder="VD: 106.6297" />
          </Form.Item>
          <Form.Item name="openingTime" label="Giờ mở cửa" rules={[{ required: true }]}>
            <Input placeholder="VD: 07:00:00" />
          </Form.Item>
          <Form.Item name="closingTime" label="Giờ đóng cửa" rules={[{ required: true }]}>
            <Input placeholder="VD: 17:00:00" />
          </Form.Item>
          <Form.Item name="type" label="Loại bưu cục" initialValue="Post Office"> 
            <Select options={[{ label: 'Trụ sở chính', value: 'Head Office' }, { label: 'Bưu cục', value: 'Post Office' }]} />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="Active"> 
            <Select options={[{ label: 'Hoạt động', value: 'Active' }, { label: 'Khóa', value: 'Inactive' }, { label: 'Bảo trì', value: 'Maintenance' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminPostOffices;
