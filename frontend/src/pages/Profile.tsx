import React, { useEffect } from 'react';
import { Card, Button, Avatar, Typography, Row, Col, Tag, message, Space } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getProfile } from '../store/authSlice';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'manager': return 'blue';
      case 'driver': return 'green';
      case 'staff': return 'purple';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'driver': return 'Tài xế';
      case 'staff': return 'Nhân viên';
      default: return role;
    }
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  return (
    <Row justify="center">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card
          style={{ borderRadius: 16, padding: 24, textAlign: 'center' }}
          bodyStyle={{ padding: 24 }}
        >
          {/* Avatar + Tên + Role */}
          <Avatar size={100} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
          <Title level={3} style={{ marginBottom: 8 }}>
            {capitalize(user?.firstName || "")} {capitalize(user?.lastName || "")}
          </Title>
          <Tag color={getRoleColor(user?.role || '')} style={{ fontSize: 14, padding: '4px 12px' }}>
            {getRoleText(user?.role || '')}
          </Tag>

          {/* Thông tin cá nhân */}
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text><MailOutlined /> <b>Email:</b> {user?.email}</Text>
              <Text><PhoneOutlined /> <b>Số điện thoại:</b> {user?.phoneNumber}</Text>
              <Text>
                <IdcardOutlined /> <b>Trạng thái tài khoản:</b>{' '}
                <Tag color={user?.isVerified ? 'green' : 'red'}>
                  {user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
              </Text>
              <Text>
                {user?.isActive ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined style={{ color: 'red' }} />} <b>Hoạt động:</b>{' '}
                {user?.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              </Text>
              {user?.lastLoginAt && (
                <Text>
                  <LoginOutlined /> <b>Lần đăng nhập cuối:</b>{' '}
                  {new Date(user.lastLoginAt).toLocaleString('vi-VN')}
                </Text>
              )}
              <Text>
                <CalendarOutlined /> <b>Ngày tạo:</b>{' '}
                {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
              </Text>
            </Space>
          </div>

          {/* Button */}
          <div style={{ marginTop: 32}}>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              shape="round" 
              size="large"
              style={{backgroundColor: "#1C3D90"}}
              onClick={() => message.info('Tính năng đang phát triển')}
            >
              Chỉnh sửa thông tin
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Profile;