import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Input,
  Modal,
  message,
  Divider,
  Statistic,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import shipperService from '../../services/shipperService';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OrderItem {
  id: number;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  weight: number;
  codAmount: number;
  totalAmount: number;
  status: 'assigned' | 'in_progress' | 'delivered' | 'failed' | 'returned';
  priority: 'normal' | 'urgent';
  serviceType: string;
  deliveryTime: string;
  notes?: string;
  assignedAt: string;
  estimatedDelivery: string;
  route: string;
  postOffice: {
    id: number;
    name: string;
    address: string;
  };
}

interface FilterParams {
  status?: string;
  priority?: string;
  route?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  search?: string;
  serviceType?: string;
}

const ShipperOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  // Chỉ hiển thị các đơn đã được phân (assigned)

  // Bỏ dữ liệu mẫu: lấy hoàn toàn từ API

  useEffect(() => {
    fetchOrders();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.search
      } as any;
      const res = await shipperService.getOrders(params);
      setOrders(res.orders as any);
      setPagination(prev => ({ ...prev, total: res.pagination.total }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Loại bỏ logic Nhận đơn khỏi trang này

  const handleStartDelivery = (orderId: number) => {
    Modal.confirm({
      title: 'Bắt đầu giao hàng',
      content: 'Bạn có chắc chắn muốn bắt đầu giao đơn hàng này?',
      onOk: async () => {
        try {
          setLoading(true);
          await shipperService.updateDeliveryStatus(orderId, { status: 'in_transit' });
          message.success('Đã bắt đầu giao hàng');
          fetchOrders();
        } catch (error) {
          message.error('Lỗi khi cập nhật trạng thái');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleUnclaim = async (orderId: number) => {
    Modal.confirm({
      title: 'Hủy nhận đơn',
      content: 'Bạn có chắc muốn hủy nhận đơn này? Đơn sẽ quay lại danh sách chưa gán.',
      okText: 'Hủy nhận',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          setLoading(true);
          await shipperService.unclaimOrder(orderId);
          message.success('Đã hủy nhận đơn');
          fetchOrders();
        } catch (error) {
          console.error('Error unclaiming order:', error);
          message.error('Không thể hủy nhận đơn (chỉ cho phép khi chuyến còn Pending)');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'blue';
      case 'picked_up': return 'orange';
      case 'in_transit': return 'processing';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'assigned': return 'blue';
      case 'in_progress': return 'orange';
      case 'failed': return 'red';
      case 'returned': return 'purple';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'picked_up': return 'Đã lấy hàng';
      case 'in_transit': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      case 'assigned': return 'Được phân công';
      case 'in_progress': return 'Đang giao';
      case 'failed': return 'Giao thất bại';
      case 'returned': return 'Đã hoàn';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'red' : 'default';
  };

  const getPriorityText = (priority: string) => {
    return priority === 'urgent' ? 'Ưu tiên' : 'Thường';
  };

  const resetFilters = () => {
    setFilters({});
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 140,
      render: (text: string, record: OrderItem) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: '13px' }}>{text}</Text>
          <Tag color={getPriorityColor(record.priority)}>
            {getPriorityText(record.priority)}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Thông tin người nhận',
      key: 'recipient',
      width: 200,
      render: (record: OrderItem) => (
        <Space direction="vertical" size={2}>
          <Text strong>{record.recipientName}</Text>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
            <Text style={{ fontSize: '12px' }}>{record.recipientPhone}</Text>
          </Space>
          <Space size={4}>
            <EnvironmentOutlined style={{ fontSize: '12px', color: '#52c41a' }} />
            <Text style={{ fontSize: '12px' }} ellipsis={{ tooltip: record.recipientAddress }}>
              {record.recipientAddress}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Dịch vụ & COD',
      key: 'service',
      width: 120,
      render: (record: OrderItem) => (
        <Space direction="vertical" size={2}>
          <Tag color="blue">{record.serviceType}</Tag>
          <Space size={4}>
            <DollarOutlined style={{ fontSize: '12px', color: record.codAmount > 0 ? '#52c41a' : '#8c8c8c' }} />
            <Text style={{ fontSize: '12px', color: record.codAmount > 0 ? '#52c41a' : '#8c8c8c' }}>
              {record.codAmount > 0 ? `${record.codAmount.toLocaleString()}đ` : 'Không COD'}
            </Text>
          </Space>
          <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {record.weight}kg
          </Text>
        </Space>
      ),
    },
    {
      title: 'Tuyến & Thời gian',
      key: 'route',
      width: 150,
      render: (record: OrderItem) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: '12px' }}>{record.route}</Text>
          <Space size={4}>
            <ClockCircleOutlined style={{ fontSize: '12px', color: '#faad14' }} />
            <Text style={{ fontSize: '12px' }}>
              Dự kiến: {dayjs(record.estimatedDelivery).format('DD/MM HH:mm')}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (record: OrderItem) => (
        <Space direction="vertical" size={4}>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/shipper/orders/${record.id}`)}
          >
            Chi tiết
          </Button>
          {record.status !== 'in_progress' && (
            <Button 
              type="primary" 
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartDelivery(record.id)}
            >
              Bắt đầu giao
            </Button>
          )}
          {(
            <Button danger type="link" size="small" onClick={() => handleUnclaim(record.id)}>Bỏ nhận</Button>
          )}
          {record.status === 'in_progress' && (
            <Button 
              type="default" 
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => navigate(`/shipper/delivery/${record.id}`)}
            >
              Cập nhật
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Thống kê nhanh
  const stats = {
    total: orders.length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    inProgress: orders.filter(o => o.status === 'in_progress').length,
    urgent: orders.filter(o => o.priority === 'urgent').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Danh sách đơn hàng cần giao</Title>
      
      {/* Thống kê nhanh */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Chờ giao"
              value={stats.assigned}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Đang giao"
              value={stats.inProgress}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Ưu tiên"
              value={stats.urgent}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Bộ lọc */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm theo mã đơn, tên, SĐT..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="assigned">Được phân công</Option>
              <Option value="in_progress">Đang giao</Option>
              <Option value="delivered">Đã giao</Option>
              <Option value="failed">Giao thất bại</Option>
              <Option value="returned">Đã hoàn</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Độ ưu tiên"
              style={{ width: '100%' }}
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              allowClear
            >
              <Option value="urgent">Ưu tiên</Option>
              <Option value="normal">Thường</Option>
            </Select>
          </Col>
          {/* Bỏ các bộ lọc tuyến và dịch vụ dựa trên dữ liệu mẫu */}
          <Col xs={24} sm={12} md={2}>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchOrders}
                loading={loading}
              />
              <Button 
                icon={<FilterOutlined />} 
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
            onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize }))
          }}
          scroll={{ x: 1000 }}
          size="small"
          rowClassName={(record) => record.priority === 'urgent' ? 'urgent-row' : ''}
        />
      </Card>

      {/* Style cho dòng ưu tiên */}
      <style>{`
        .urgent-row { background-color: #fff2f0 !important; }
        .urgent-row:hover { background-color: #ffebe6 !important; }
      `}</style>
    </div>
  );
};

export default ShipperOrders;

