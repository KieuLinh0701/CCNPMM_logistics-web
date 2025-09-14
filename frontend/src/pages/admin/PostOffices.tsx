import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
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

  const fetchData = async () => {
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
  };

  useEffect(() => { fetchData(); }, [query.page, query.limit, query.search]);

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
        name: editing.name,
        address: editing.address,
        phone: editing.phone,
        workingHours: editing.workingHours,
        area: editing.area,
        status: editing.status,
      });
    }
  }, [editing, open, form]);

  const onDelete = async (id: number) => {
    try {
      await adminAPI.deletePostOffice(id);
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
    { title: 'Tên bưu cục', dataIndex: 'name' },
    { title: 'Địa chỉ', dataIndex: 'address', ellipsis: true },
    { title: 'Điện thoại', dataIndex: 'phone' },
    { title: 'Giờ làm việc', dataIndex: 'workingHours' },
    { title: 'Khu vực', dataIndex: 'area' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? 'Hoạt động' : 'Khóa'}</Tag> 
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
  ], []);

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
          <Form.Item name="name" label="Tên bưu cục" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="workingHours" label="Giờ làm việc" rules={[{ required: true }]}>
            <Input placeholder="VD: 8:00-17:00 hoặc 24/7" />
          </Form.Item>
          <Form.Item name="area" label="Khu vực" rules={[{ required: true }]}>
            <Input placeholder="VD: Quận 1, TP.HCM" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="active"> 
            <Select options={[{ label: 'Hoạt động', value: 'active' }, { label: 'Khóa', value: 'inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminPostOffices;
