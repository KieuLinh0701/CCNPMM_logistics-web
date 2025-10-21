import React, { useState, useEffect } from "react";
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu, Badge, List, Divider } from "antd";
import { UserOutlined, LogoutOutlined, ProfileOutlined, PlusOutlined, BellOutlined, ShoppingCartOutlined, ClockCircleOutlined, ExclamationCircleOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";
import { getSocket } from "../../services/socket";
import { notificationService, NotificationItem } from "../../services/notificationService";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const fileName = user?.images ? String(user.images).split('/').pop() : undefined;
  const avatarSrc = fileName ? `/uploads/${fileName}` : undefined;
  const displayName = user?.firstName || user?.lastName
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : (user?.email || 'User');

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login"); 
  };

  const handleProfile = () => {
    if (user?.role) {
      navigate(`/${user.role}/profile`);
    } else {
      navigate("/profile"); 
    }
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .filter(Boolean) 
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Fetch notifications từ API
  const fetchNotifications = async () => {
    if (user?.role !== 'shipper') return;
    
    try {
      console.log('Fetching notifications from API...');
      setLoading(true);
      const response = await notificationService.getNotifications({ 
        page: 1, 
        limit: 10 
      });
      
      console.log('API response:', response);
      
      if (response.success && response.data) {
        console.log('Notifications loaded:', response.data.notifications.length);
        setNotifications(response.data.notifications);
      } else {
        console.log('Failed to load notifications:', response.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to WebSocket notifications
  useEffect(() => {
    if (user?.role === 'shipper') {
      console.log('Setting up notifications for shipper:', user.id);
      
      // Fetch initial notifications from database
      fetchNotifications();
      
      // Connect to WebSocket
      const socket = getSocket();
      console.log('Socket connected:', socket.connected);
      
      // Re-register user with WebSocket when user changes
      if (user?.id) {
        console.log('Re-registering user with WebSocket:', user.id);
        socket.emit('register', user.id);
      }
      
      const onServerNotification = (payload: any) => {
        console.log('Received WebSocket notification:', payload);
        
        // Add new notification to the list (notification đã được lưu vào DB từ backend)
        const newNotification: NotificationItem = {
          id: payload.id || Date.now(),
          title: payload.title || 'Thông báo',
          message: payload.message || '',
          type: payload.type || 'system',
          isRead: payload.isRead || false,
          userId: user.id,
          createdAt: payload.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log('Adding notification to state:', newNotification);
        
        // Thêm vào đầu danh sách và giới hạn 20 thông báo
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      };

      socket.on('notification', onServerNotification);
      console.log('Listening for notification events');

      return () => {
        console.log('Cleaning up notification listeners');
        socket.off('notification', onServerNotification);
      };
    }
  }, [user?.role, user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
        return <ShoppingCartOutlined style={{ color: '#1890ff' }} />;
      case 'delivery_assigned':
        return <ClockCircleOutlined style={{ color: '#52c41a' }} />;
      case 'delivery_started':
        return <PlayCircleOutlined style={{ color: '#1890ff' }} />;
      case 'route_change':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'cod_reminder':
        return <BellOutlined style={{ color: '#f5222d' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    try {
      // Đánh dấu đã đọc nếu chưa đọc
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      }
      
      // Điều hướng theo loại thông báo
      switch (notification.type) {
        case 'new_order':
        case 'delivery_assigned':
          navigate('/shipper/orders');
          break;
        case 'route_change':
          navigate('/shipper/route');
          break;
        case 'cod_reminder':
          navigate('/shipper/cod');
          break;
        default:
          navigate('/shipper/orders');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Format thời gian từ createdAt
  const formatTime = (createdAt: string) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={handleProfile}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Menu dropdown cho thông báo
  const notificationMenu = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <Badge count={unreadCount} style={{ marginLeft: 8 }} />
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          <BellOutlined style={{ fontSize: 24, marginBottom: 8 }} />
          <div>Chưa có thông báo nào</div>
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: notification.isRead ? '#fff' : '#f6ffed',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(notification.type)}
                title={
                  <Space>
                    <Text strong={!notification.isRead}>{notification.title}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatTime(notification.createdAt)}
                    </Text>
                  </Space>
                }
                description={
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {notification.message}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: '8px 16px', textAlign: 'center' }}>
        <Button 
          type="link" 
          size="small"
          onClick={() => navigate('/shipper/orders')}
        >
          Xem đơn hàng
        </Button>
      </div>
    </div>
  );

  return (
    <AntHeader
      style={{
        background: "#1C3D90", // xanh trầm hơn
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Góc trái - Tên website */}
      <Link to="/home">
        <Text strong style={{ fontSize: "18px", color: "#fff" }}>
          UTELogistics
        </Text>
      </Link>

      {/* Góc phải */}
      <Space size="middle">
        {user?.role === "manager" && (
          <Button
            type="primary"
            ghost
            style={{ borderColor: "#fff", color: "#fff" }}
            icon={<PlusOutlined />}
            onClick={() => navigate("/manager/orders/create")}
          >
            Tạo đơn hàng
          </Button>
        )}

        {/* Thông báo cho shipper */}
        {user?.role === "shipper" && (
          <Dropdown overlay={notificationMenu} placement="bottomRight" trigger={["click"]}>
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ 
                  color: "#fff", 
                  fontSize: "18px",
                  border: "none",
                  background: "transparent"
                }}
              />
            </Badge>
          </Dropdown>
        )}

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer", color: "#fff" }}>
            <Avatar src={avatarSrc} icon={<UserOutlined />} 
            style={{
              background: "linear-gradient(135deg, #3a7bd5, #00d2ff)",
              color: "#fff",
              fontWeight: "bold",
            }}/>
            <Text style={{ color: "#fff" }}>
              {user?.firstName && user?.lastName
                ? `${capitalize(user.firstName)} ${capitalize(user.lastName)}`
                : "User"}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;