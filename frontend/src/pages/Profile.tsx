import React, { useEffect, useState } from 'react';
import { Card, Button, Avatar, Typography, Row, Col, Tag, message, Space, Modal, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UserOutlined, EditOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getProfile, updateAvatar, updateProfile } from '../store/authSlice';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm imports

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Thêm useLocation
  const { user, loading } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Kiểm tra xem có phải đang từ trang tạo order không
  const isFromOrderCreate = location.pathname.includes('/orders/create/edit-profile');

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user?.images) {
      const fileName = user.images.split('/').pop();
      setAvatarSrc(fileName ? `/uploads/${fileName}` : undefined);
      setAvatarPreview(fileName ? `/uploads/${fileName}` : undefined);
    } else {
      setAvatarSrc(undefined);
      setAvatarPreview(undefined);
    }
  }, [user?.images]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'manager': return 'blue';
      case 'driver': return 'green';
      case 'user': return 'purple';
      case 'shipper': return 'orange';
      default: return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'driver': return 'Tài xế';
      case 'user': return 'Chủ cửa hàng';
      case 'shipper': return 'Nhân viên giao hàng';
      case 'driver': return 'Tài xê';
      default: return role;
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

  const handleUpdateSuccess = () => {
    message.success('Cập nhật thành công');
    setOpen(false);
    
    // Nếu đang từ trang tạo order, quay về trang tạo order
    if (isFromOrderCreate && user) {
      navigate(`/${user.role}/orders/create`); // Điều chỉnh đường dẫn theo route của bạn
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const values = await form.validateFields();
      await (dispatch(updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        detailAddress: values.detailAddress,
        codeWard: values.codeWard ? Number(values.codeWard) : undefined,
        codeCity: values.codeCity ? Number(values.codeCity) : undefined,
      }) as any)).unwrap();
      
      // Chỉ cập nhật ảnh khi ấn Đồng ý
      if (avatarFile) {
        await (dispatch(updateAvatar(avatarFile) as any)).unwrap();
        setAvatarFile(null);
      }
      
      handleUpdateSuccess();
    } catch (e: any) {
      if (!e?.errorFields) message.error(e || 'Cập nhật thất bại');
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
    <Row justify="center"
      align="middle"
      style={{ textAlign: 'center', padding: 16 }}>
      <Col xs={24} sm={20} md={16} lg={12}>
          {/* Hiển thị thông báo nếu đang từ trang tạo order */}
          {isFromOrderCreate && (
            <Card 
              style={{ 
                marginBottom: 24, 
                backgroundColor: '#fffbe6',
                border: '1px solid #ffe58f'
              }}
            >
              <Text style={{ color: '#d48806' }}>
                ⚠️ Vui lòng cập nhật địa chỉ trong hồ sơ cá nhân để sử dụng thông tin này. 
                Sau khi cập nhật xong, bạn sẽ được chuyển về trang tạo đơn hàng.
              </Text>
            </Card>
          )}

          {/* Avatar + Tên + Role */}
          <Avatar size={120} src={avatarSrc} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
          <Title level={3} style={{ marginBottom: 8 }}>
            {capitalize(user?.lastName || "")} {capitalize(user?.firstName || "")}
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
              onClick={() => {
                form.setFieldsValue({
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  phoneNumber: user?.phoneNumber,
                  detailAddress: user?.detailAddress,
                  codeWard: user?.codeWard,
                  codeCity: user?.codeCity,
                });
                setAvatarPreview(user?.images ? `/uploads/${user.images.split('/').pop()}` : undefined);
                setOpen(true);
              }}
            >
              Chỉnh sửa thông tin
            </Button>
          </div>
      </Col>
      <Modal
        title="Chỉnh sửa thông tin"
        open={open}
        onCancel={() => {
          setOpen(false);
          // Revert preview and pending file when cancel
          if (user?.images) {
            const fileName = user.images.split('/').pop();
            const url = fileName ? `/uploads/${fileName}` : undefined;
            setAvatarPreview(url);
          } else {
            setAvatarPreview(undefined);
          }
          setAvatarFile(null);
        }}
        onOk={handleUpdateProfile} // Sử dụng hàm mới
        okText={isFromOrderCreate ? "Cập nhật và quay lại" : "Cập nhật"} // Thay đổi text nút
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={async (info) => {
                const raw = info.file as any;
                const blob: Blob | undefined = (raw?.originFileObj as File) || (raw as Blob);
                if (blob && blob instanceof Blob) {
                  // Live preview
                  const url = URL.createObjectURL(blob);
                  setAvatarPreview(url);
                  const file: File = blob instanceof File ? blob : new File([blob], 'avatar.jpg', { type: blob.type || 'image/jpeg' });
                  setAvatarFile(file);
                }
              }}
            >
              <Avatar size={96} src={avatarPreview} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
            </Upload>
          </div>
          <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="detailAddress" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item name="codeWard" label="Phường/Xã (mã)">
            <Input />
          </Form.Item>
          <Form.Item name="codeCity" label="Tỉnh/Thành (mã)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default Profile;