import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Badge,
  Modal,
  Descriptions,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
  Empty,
  Switch
} from 'antd';
import { 
  BellOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EnvironmentOutlined,
  BoxPlotOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

interface Notification {
  id: number;
  type: 'urgent' | 'route_change' | 'new_order' | 'system' | 'cod_reminder' | 'weather_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedOrderId?: number;
  relatedTrackingNumber?: string;
  actionRequired?: boolean;
  expiresAt?: string;
  metadata?: {
    [key: string]: any;
  };
}

interface NotificationSettings {
  urgentOrders: boolean;
  routeChanges: boolean;
  newOrders: boolean;
  systemUpdates: boolean;
  codReminders: boolean;
  weatherAlerts: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

const ShipperNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    urgentOrders: true,
    routeChanges: true,
    newOrders: true,
    systemUpdates: true,
    codReminders: true,
    weatherAlerts: true,
    soundEnabled: true,
    pushEnabled: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Gọi API thực tế
      // Dữ liệu mẫu
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'urgent',
          title: 'Đơn hàng ưu tiên cần giao ngay',
          message: 'Có 2 đơn hàng ưu tiên cần được giao trong vòng 2 giờ tới. Vui lòng ưu tiên giao các đơn hàng này.',
          timestamp: '2024-01-15 10:30:00',
          read: false,
          priority: 'urgent',
          actionRequired: true,
          expiresAt: '2024-01-15 12:30:00',
          metadata: {
            orderCount: 2,
            deadline: '2024-01-15 12:30:00'
          }
        },
        {
          id: 2,
          type: 'route_change',
          title: 'Thay đổi lộ trình giao hàng',
          message: 'Lộ trình giao hàng khu vực Quận 1 đã được cập nhật do tình hình giao thông. Vui lòng kiểm tra lại tuyến đường.',
          timestamp: '2024-01-15 09:15:00',
          read: false,
          priority: 'high',
          actionRequired: true,
          metadata: {
            affectedArea: 'Quận 1',
            reason: 'Tình hình giao thông'
          }
        },
        {
          id: 3,
          type: 'new_order',
          title: 'Đơn hàng mới được phân công',
          message: 'Bạn có 3 đơn hàng mới được phân công cho tuyến giao hàng hôm nay.',
          timestamp: '2024-01-15 08:45:00',
          read: true,
          priority: 'medium',
          relatedOrderId: 123,
          metadata: {
            orderCount: 3,
            route: 'Tuyến 1 - Q1, Q3'
          }
        },
        {
          id: 4,
          type: 'cod_reminder',
          title: 'Nhắc nhở nộp tiền COD',
          message: 'Bạn có 1.500.000đ tiền COD chưa nộp. Vui lòng nộp tiền trước 17:00 hôm nay.',
          timestamp: '2024-01-15 08:00:00',
          read: true,
          priority: 'high',
          actionRequired: true,
          expiresAt: '2024-01-15 17:00:00',
          metadata: {
            amount: 1500000,
            deadline: '2024-01-15 17:00:00'
          }
        },
        {
          id: 5,
          type: 'weather_alert',
          title: 'Cảnh báo thời tiết',
          message: 'Dự báo có mưa lớn từ 14:00 - 16:00. Vui lòng chuẩn bị đồ che mưa và bảo vệ hàng hóa.',
          timestamp: '2024-01-15 07:30:00',
          read: true,
          priority: 'medium',
          metadata: {
            weatherType: 'heavy_rain',
            timeRange: '14:00 - 16:00'
          }
        },
        {
          id: 6,
          type: 'system',
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống sẽ được bảo trì từ 22:00 - 23:00 tối nay. Vui lòng hoàn thành các thao tác trước thời gian này.',
          timestamp: '2024-01-14 18:00:00',
          read: true,
          priority: 'low',
          metadata: {
            maintenanceStart: '2024-01-15 22:00:00',
            maintenanceEnd: '2024-01-15 23:00:00'
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      // TODO: Gọi API đánh dấu đã đọc
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Gọi API đánh dấu tất cả đã đọc
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      // TODO: Gọi API xóa thông báo
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleViewDetail = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setDetailModal(true);
  };

  const handleUpdateSettings = async (newSettings: NotificationSettings) => {
    try {
      // TODO: Gọi API cập nhật cài đặt
      setSettings(newSettings);
      setSettingsModal(false);
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'route_change': return <EnvironmentOutlined style={{ color: '#1890ff' }} />;
      case 'new_order': return <BoxPlotOutlined style={{ color: '#52c41a' }} />;
      case 'cod_reminder': return <DollarOutlined style={{ color: '#faad14' }} />;
      case 'weather_alert': return <WarningOutlined style={{ color: '#fa8c16' }} />;
      case 'system': return <InfoCircleOutlined style={{ color: '#722ed1' }} />;
      default: return <BellOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'urgent': return 'Đơn hàng ưu tiên';
      case 'route_change': return 'Thay đổi lộ trình';
      case 'new_order': return 'Đơn hàng mới';
      case 'cod_reminder': return 'Nhắc nhở COD';
      case 'weather_alert': return 'Cảnh báo thời tiết';
      case 'system': return 'Hệ thống';
      default: return 'Khác';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2}>
            <BellOutlined /> Thông báo
            {unreadCount > 0 && (
              <Badge count={unreadCount} style={{ marginLeft: '8px' }} />
            )}
          </Title>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<SettingOutlined />}
              onClick={() => setSettingsModal(true)}
            >
              Cài đặt
            </Button>
            {unreadCount > 0 && (
              <Button 
                type="primary"
                onClick={handleMarkAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </Space>
        </Col>
      </Row>

      {/* Thống kê nhanh */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Chưa đọc"
              value={unreadCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Khẩn cấp"
              value={urgentCount}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Cần hành động"
              value={actionRequiredCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng thông báo"
              value={notifications.length}
              prefix={<InfoCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Danh sách thông báo */}
      <Card>
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo nào" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                style={{
                  backgroundColor: !notification.read ? '#f0f9ff' : 'transparent',
                  border: notification.priority === 'urgent' && !notification.read ? '1px solid #ff4d4f' : 'none',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  padding: '16px'
                }}
                actions={[
                  <Button 
                    type="link" 
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(notification)}
                  >
                    Xem
                  </Button>,
                  <Button 
                    type="link" 
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    Xóa
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!notification.read}>
                      {getNotificationIcon(notification.type)}
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong={!notification.read}>{notification.title}</Text>
                      <Tag color={getPriorityColor(notification.priority)}>
                        {getPriorityText(notification.priority)}
                      </Tag>
                      <Tag>{getTypeText(notification.type)}</Tag>
                      {notification.actionRequired && (
                        <Tag color="orange">Cần hành động</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text style={{ fontSize: '14px' }}>{notification.message}</Text>
                      <Space>
                        <ClockCircleOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(notification.timestamp).fromNow()}
                        </Text>
                        {notification.expiresAt && (
                          <>
                            <Text type="secondary" style={{ fontSize: '12px' }}>•</Text>
                            <Text type="danger" style={{ fontSize: '12px' }}>
                              Hết hạn: {dayjs(notification.expiresAt).format('DD/MM HH:mm')}
                            </Text>
                          </>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Modal chi tiết thông báo */}
      <Modal
        title="Chi tiết thông báo"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedNotification && (
          <div>
            <Space style={{ marginBottom: '16px' }}>
              {getNotificationIcon(selectedNotification.type)}
              <Title level={4} style={{ margin: 0 }}>
                {selectedNotification.title}
              </Title>
              <Tag color={getPriorityColor(selectedNotification.priority)}>
                {getPriorityText(selectedNotification.priority)}
              </Tag>
            </Space>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Loại thông báo">
                {getTypeText(selectedNotification.type)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {dayjs(selectedNotification.timestamp).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                <Tag color={getPriorityColor(selectedNotification.priority)}>
                  {getPriorityText(selectedNotification.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedNotification.read ? 'green' : 'orange'}>
                  {selectedNotification.read ? 'Đã đọc' : 'Chưa đọc'}
                </Tag>
              </Descriptions.Item>
              {selectedNotification.expiresAt && (
                <Descriptions.Item label="Hết hạn" span={2}>
                  <Text type="danger">
                    {dayjs(selectedNotification.expiresAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={5}>Nội dung:</Title>
            <Paragraph>{selectedNotification.message}</Paragraph>

            {selectedNotification.actionRequired && (
              <Alert
                message="Cần hành động"
                description="Thông báo này yêu cầu bạn thực hiện một số hành động cụ thể."
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}

            {selectedNotification.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Thông tin bổ sung:</Title>
                <Descriptions column={1} size="small">
                  {Object.entries(selectedNotification.metadata).map(([key, value]) => (
                    <Descriptions.Item key={key} label={key}>
                      {typeof value === 'string' && value.includes('2024') ? 
                        dayjs(value).format('DD/MM/YYYY HH:mm') : 
                        String(value)
                      }
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal cài đặt thông báo */}
      <Modal
        title="Cài đặt thông báo"
        open={settingsModal}
        onCancel={() => setSettingsModal(false)}
        onOk={() => handleUpdateSettings(settings)}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Title level={5}>Loại thông báo:</Title>
          
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                <Text>Đơn hàng ưu tiên</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.urgentOrders}
                onChange={(checked) => setSettings(prev => ({ ...prev, urgentOrders: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <Text>Thay đổi lộ trình</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.routeChanges}
                onChange={(checked) => setSettings(prev => ({ ...prev, routeChanges: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <BoxPlotOutlined style={{ color: '#52c41a' }} />
                <Text>Đơn hàng mới</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.newOrders}
                onChange={(checked) => setSettings(prev => ({ ...prev, newOrders: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <DollarOutlined style={{ color: '#faad14' }} />
                <Text>Nhắc nhở COD</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.codReminders}
                onChange={(checked) => setSettings(prev => ({ ...prev, codReminders: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <WarningOutlined style={{ color: '#fa8c16' }} />
                <Text>Cảnh báo thời tiết</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.weatherAlerts}
                onChange={(checked) => setSettings(prev => ({ ...prev, weatherAlerts: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <InfoCircleOutlined style={{ color: '#722ed1' }} />
                <Text>Cập nhật hệ thống</Text>
              </Space>
            </Col>
            <Col>
              <Switch 
                checked={settings.systemUpdates}
                onChange={(checked) => setSettings(prev => ({ ...prev, systemUpdates: checked }))}
              />
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Cài đặt khác:</Title>

          <Row justify="space-between" align="middle">
            <Col>
              <Text>Âm thanh thông báo</Text>
            </Col>
            <Col>
              <Switch 
                checked={settings.soundEnabled}
                onChange={(checked) => setSettings(prev => ({ ...prev, soundEnabled: checked }))}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Text>Thông báo đẩy</Text>
            </Col>
            <Col>
              <Switch 
                checked={settings.pushEnabled}
                onChange={(checked) => setSettings(prev => ({ ...prev, pushEnabled: checked }))}
              />
            </Col>
          </Row>
        </Space>
      </Modal>
    </div>
  );
};

export default ShipperNotifications;

