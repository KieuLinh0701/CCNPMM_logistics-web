import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, List, Badge, message } from 'antd';
import { 
  TruckOutlined, 
  BoxPlotOutlined, 
  DollarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';

const { Title, Text } = Typography;

interface DeliveryStats {
  totalAssigned: number;
  inProgress: number;
  delivered: number;
  failed: number;
  codCollected: number;
}

interface OrderSummary {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  recipientPhone: string;
  codAmount: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'normal' | 'urgent';
  serviceType: string;
}

interface Notification {
  id: number;
  type: 'urgent' | 'route_change' | 'new_order' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ShipperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DeliveryStats>({
    totalAssigned: 0,
    inProgress: 0,
    delivered: 0,
    failed: 0,
    codCollected: 0
  });
  
  const [todayOrders, setTodayOrders] = useState<OrderSummary[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await shipperService.getDashboard();
      setStats(res.stats);
      // Chuẩn hoá todayOrders nếu backend trả gói {orders, pagination}
      const today = Array.isArray((res as any).todayOrders?.orders)
        ? (res as any).todayOrders.orders
        : (res as any).todayOrders || [];
      setTodayOrders(today);
      setNotifications(res.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Lỗi khi tải dashboard');
    } finally {
      setLoading(false);
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'route_change': return <EnvironmentOutlined style={{ color: '#1890ff' }} />;
      case 'new_order': return <BoxPlotOutlined style={{ color: '#52c41a' }} />;
      default: return <BellOutlined style={{ color: '#faad14' }} />;
    }
  };

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text: string, record: OrderSummary) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.priority === 'urgent' && <Tag color="red">Ưu tiên</Tag>}
        </Space>
      ),
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      render: (record: OrderSummary) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.recipientName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.recipientPhone}</Text>
        </Space>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'recipientAddress',
      key: 'recipientAddress',
      ellipsis: true,
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      render: (amount: number) => (
        <Text strong style={{ color: amount > 0 ? '#52c41a' : '#8c8c8c' }}>
          {amount > 0 ? `${amount.toLocaleString()}đ` : 'Không'}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: OrderSummary) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => navigate(`/shipper/orders/${record.id}`)}
          >
            Chi tiết
          </Button>
          {record.status === 'confirmed' && (
            <Button 
              type="primary" 
              onClick={() => navigate(`/shipper/delivery/${record.id}`)}
            >
              Bắt đầu giao
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard Shipper</Title>
      
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn được phân công"
              value={stats.totalAssigned}
              prefix={<BoxPlotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang giao"
              value={stats.inProgress}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã giao thành công"
              value={stats.delivered}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="COD đã thu"
              value={stats.codCollected}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value?.toLocaleString()}đ`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Đơn hàng hôm nay */}
        <Col xs={24} lg={16}>
          <Card 
            title="Đơn hàng hôm nay" 
            extra={
              <Space>
                <Button type="primary" onClick={() => navigate('/shipper/orders')}>
                  Xem tất cả
                </Button>
                <Button onClick={() => navigate('/shipper/route')}>
                  Xem lộ trình
                </Button>
              </Space>
            }
          >
            <Table
              columns={orderColumns}
              dataSource={todayOrders}
              rowKey="id"
              pagination={false}
              loading={loading}
            />
          </Card>
        </Col>

        {/* Thông báo và tiện ích */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <BellOutlined />
                Thông báo
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge count={notifications.filter(n => !n.read).length} />
                )}
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <List
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={getNotificationIcon(item.type)}
                    title={
                      <Space>
                        <Text strong={!item.read}>{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.message}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Tiện ích nhanh */}
          <Card title="Tiện ích nhanh">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="default" 
                block 
                icon={<BoxPlotOutlined />}
                onClick={() => navigate('/shipper/pickup')}
              >
                Nhận hàng từ bưu cục
              </Button>
              <Button 
                type="default" 
                block 
                icon={<DollarOutlined />}
                onClick={() => navigate('/shipper/cod')}
              >
                Quản lý COD
              </Button>
              <Button 
                type="default" 
                block 
                icon={<ExclamationCircleOutlined />}
                onClick={() => navigate('/shipper/report')}
              >
                Báo cáo sự cố
              </Button>
              <Button 
                type="default" 
                block 
                icon={<ClockCircleOutlined />}
                onClick={() => navigate('/shipper/history')}
              >
                Lịch sử giao hàng
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShipperDashboard;