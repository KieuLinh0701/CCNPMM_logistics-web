import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { adminAPI, UserRow } from '../../services/api';

type QueryState = { page: number; limit: number; search: string };

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Staff', value: 'staff' },
  { label: 'Driver', value: 'driver' },
];

const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<QueryState>({ page: 1, limit: 10, search: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.listUsers({ page: query.page, limit: query.limit, search: query.search });
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

  const onEdit = (record: UserRow) => {
    setEditing(record);
    setOpen(true);
  };

  // Ensure fields are prefilled whenever editing changes or modal opens
  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        email: editing.email,
        firstName: editing.firstName,
        lastName: editing.lastName,
        phoneNumber: editing.phoneNumber,
        role: editing.role,
        isActive: editing.isActive,
      });
    }
  }, [editing, open, form]);

  const onDelete = async (id: number) => {
    try {
      await adminAPI.deleteUser(id);
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
        await adminAPI.updateUser(editing.id, {
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          role: values.role,
          isActive: values.isActive,
        });
        message.success('Cập nhật thành công');
      } else {
        await adminAPI.createUser({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber,
          role: values.role,
          isActive: values.isActive,
        });
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
    { title: 'Email', dataIndex: 'email' },
    { title: 'Họ', dataIndex: 'lastName' },
    { title: 'Tên', dataIndex: 'firstName' },
    { title: 'SĐT', dataIndex: 'phoneNumber' },
    { title: 'Vai trò', dataIndex: 'role', render: (v: UserRow['role']) => <Tag color={v === 'admin' ? 'red' : v === 'manager' ? 'blue' : v === 'staff' ? 'green' : 'purple'}>{v}</Tag> },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Khóa'}</Tag> },
    {
      title: 'Thao tác',
      render: (_: any, record: UserRow) => (
        <Space>
          <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa người dùng này?" onConfirm={() => onDelete(record.id)}>
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ], []);

  return (
    <Card title="Quản lý người dùng" extra={
      <Space>
        <Input.Search allowClear placeholder="Tìm kiếm" onSearch={(v) => setQuery({ ...query, page: 1, search: v })} />
        <Button type="primary" onClick={onCreate}>Thêm người dùng</Button>
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
        title={editing ? 'Cập nhật người dùng' : 'Tạo người dùng'}
        open={open}
        onOk={submit}
        onCancel={() => setOpen(false)}
        destroyOnClose
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          {editing ? (
            <Form.Item name="email" label="Email">
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
              <Input />
            </Form.Item>
          )}
          <Form.Item name="password" label={editing ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu'} rules={editing ? [] : [{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="lastName" label="Họ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="firstName" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}> 
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái" initialValue={true}> 
            <Select options={[{ label: 'Hoạt động', value: true }, { label: 'Khóa', value: false }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminUsers;
