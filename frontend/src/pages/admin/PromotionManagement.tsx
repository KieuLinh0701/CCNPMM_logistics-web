import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  message, 
  Space, 
  Tag, 
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

interface PromotionFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  status: 'active' | 'inactive';
}

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    expiringSoon: 0
  });

  // Load promotions
  const loadPromotions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await api.get(`/admin/promotions?${params}`);
      
      if ((response.data as any).success) {
        setPromotions((response.data as any).data.promotions);
        setPagination(prev => ({
          ...prev,
          current: page,
          pageSize,
          total: (response.data as any).data.pagination.totalItems
        }));
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách chương trình khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await api.get('/admin/promotions/stats');
      if ((response.data as any).success) {
        setStats((response.data as any).data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadPromotions();
    loadStats();
  }, [filters]);

  // Handle form submit
  const handleSubmit = async (values: PromotionFormData) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate,
        endDate: values.endDate
      };

      if (editingPromotion) {
        await api.put(`/admin/promotions/${editingPromotion.id}`, data);
        message.success('Cập nhật chương trình khuyến mãi thành công');
      } else {
        await api.post('/admin/promotions', data);
        message.success('Tạo chương trình khuyến mãi thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingPromotion(null);
      loadPromotions(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Handle edit
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.setFieldsValue({
      ...promotion,
      startDate: dayjs(promotion.startDate),
      endDate: dayjs(promotion.endDate)
    });
    setModalVisible(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/promotions/${id}`);
      message.success('Xóa chương trình khuyến mãi thành công');
      loadPromotions(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/admin/promotions/${id}/status`, { status });
      message.success('Cập nhật trạng thái thành công');
      loadPromotions(pagination.current, pagination.pageSize);
      loadStats();
    } catch (error: any) {
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'expired': return 'red';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Tạm dừng';
      case 'expired': return 'Hết hạn';
      default: return status;
    }
  };

  // Check if promotion is expiring soon
  const isExpiringSoon = (endDate: string) => {
    const end = dayjs(endDate);
    const now = dayjs();
    return end.diff(now, 'days') <= 7 && end.diff(now, 'days') > 0;
  };

  const columns = [
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {code}
        </Tag>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discountType',
      key: 'discountType',
      render: (type: string, record: Promotion) => (
        <span>
          {type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}
          <br />
          <small style={{ color: '#666' }}>
            {type === 'percentage' 
              ? `${record.discountValue}%` 
              : `${record.discountValue.toLocaleString('vi-VN')}đ`
            }
          </small>
        </span>
      )
    },
    {
      title: 'Điều kiện',
      key: 'conditions',
      render: (record: Promotion) => (
        <div>
          {record.minOrderValue > 0 && (
            <div>Đơn tối thiểu: {record.minOrderValue.toLocaleString('vi-VN')}đ</div>
          )}
          {record.usageLimit && (
            <div>Giới hạn: {record.usageLimit} lượt</div>
          )}
          {record.maxDiscountAmount && record.discountType === 'percentage' && (
            <div>Giảm tối đa: {record.maxDiscountAmount.toLocaleString('vi-VN')}đ</div>
          )}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'dateRange',
      render: (record: Promotion) => (
        <div>
          <div>Từ: {dayjs(record.startDate).format('DD/MM/YYYY')}</div>
          <div>Đến: {dayjs(record.endDate).format('DD/MM/YYYY')}</div>
          {isExpiringSoon(record.endDate) && (
            <Tag color="orange">Sắp hết hạn</Tag>
          )}
        </div>
      )
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (record: Promotion) => (
        <div>
          <div>{record.usedCount} / {record.usageLimit || '∞'}</div>
          {record.usageLimit && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {Math.round((record.usedCount / record.usageLimit) * 100)}% đã sử dụng
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (record: Promotion) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title="Thay đổi trạng thái">
            <Select
              value={record.status}
              size="small"
              style={{ width: 100 }}
              onChange={(value) => handleStatusChange(record.id, value)}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              disabled={record.usedCount > 0}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Quản lý Chương trình Khuyến mãi</h2>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tạm dừng" value={stats.inactive} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Hết hạn" value={stats.expired} valueStyle={{ color: '#666' }} />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm theo mã hoặc mô tả"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm dừng</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setFilters({ status: 'all', search: '' });
                loadPromotions();
              }}
            >
              Làm mới
            </Button>
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingPromotion(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Tạo mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} mục`,
            onChange: (page, pageSize) => loadPromotions(page, pageSize || 10)
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingPromotion ? 'Chỉnh sửa chương trình khuyến mãi' : 'Tạo chương trình khuyến mãi mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingPromotion(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã khuyến mãi"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã khuyến mãi' },
                  { min: 3, message: 'Mã khuyến mãi phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input placeholder="VD: SALE20" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                initialValue="active"
              >
                <Select>
                  <Option value="active">Hoạt động</Option>
                  <Option value="inactive">Tạm dừng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} placeholder="Mô tả ngắn về chương trình" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
                initialValue="percentage"
              >
                <Select>
                  <Option value="percentage">Phần trăm (%)</Option>
                  <Option value="fixed">Số tiền cố định (đ)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label="Giá trị giảm"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị giảm' },
                  { type: 'number', min: 0.01, message: 'Giá trị phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="VD: 20 (20% hoặc 20,000đ)"
                  min={0.01}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Giá trị đơn tối thiểu (đ)"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="0"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxDiscountAmount"
                label="Giảm tối đa (đ) - Chỉ áp dụng cho phần trăm"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Không giới hạn"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="usageLimit"
            label="Giới hạn sử dụng (để trống = không giới hạn)"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Không giới hạn"
              min={1}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagement;
