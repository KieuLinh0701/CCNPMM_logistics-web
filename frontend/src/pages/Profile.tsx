import React, { useEffect } from 'react';
import { Card, Descriptions, Button, Avatar, Typography, Row, Col, Tag, message } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
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
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      case 'driver':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'manager':
        return 'Quản lý';
      case 'driver':
        return 'Tài xế';
      case 'staff':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Đang tải thông tin...</Text>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>Thông tin cá nhân</Title>
      
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={80} 
                icon={<UserOutlined />} 
                style={{ marginBottom: 16 }}
              />
              <Title level={3} style={{ marginBottom: 8 }}>
                {user?.firstName} {user?.lastName}
              </Title>
              <Tag 
                color={getRoleColor(user?.role || '')} 
                style={{ fontSize: '16px', padding: '4px 12px' }}
              >
                {getRoleText(user?.role || '')}
              </Tag>
            </div>

            <Descriptions 
              title="Chi tiết thông tin" 
              bordered 
              column={1}
              size="middle"
            >
              <Descriptions.Item label="Họ và tên">
                {user?.firstName} {user?.lastName}
              </Descriptions.Item>
              
              <Descriptions.Item label="Email">
                {user?.email}
              </Descriptions.Item>
              
              <Descriptions.Item label="Số điện thoại">
                {user?.phoneNumber}
              </Descriptions.Item>
              
              <Descriptions.Item label="Vai trò">
                <Tag color={getRoleColor(user?.role || '')}>
                  {getRoleText(user?.role || '')}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái tài khoản">
                <Tag color={user?.isVerified ? 'green' : 'red'}>
                  {user?.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái hoạt động">
                <Tag color={user?.isActive ? 'green' : 'red'}>
                  {user?.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
              </Descriptions.Item>
              
              {user?.lastLoginAt && (
                <Descriptions.Item label="Lần đăng nhập cuối">
                  {new Date(user.lastLoginAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
              
              <Descriptions.Item label="Ngày tạo tài khoản">
                {new Date(user?.createdAt || '').toLocaleDateString('vi-VN')}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => message.info('Tính năng đang phát triển')}
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;

