import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Select, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { register, verifyOTP, clearError } from '../store/authSlice';
import { RegisterData, VerifyOTPData } from '../types/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [registerData, setRegisterData] = useState<RegisterData | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinishStep1 = async (values: RegisterData) => {
    try {
      const result = await dispatch(register(values)).unwrap();
      if (result.success) {
        setRegisterData(values);
        setOtpSent(true);
        setCurrentStep(1);
        message.success('Mã OTP đã được gửi đến email của bạn!');
      }
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const onFinishStep2 = async (values: { otp: string }) => {
    if (!registerData) return;

    try {
      const verifyData: VerifyOTPData = {
        ...registerData,
        otp: values.otp,
      };

      const result = await dispatch(verifyOTP(verifyData)).unwrap();
      if (result.success) {
        message.success('Đăng ký thành công!');
        navigate('/dashboard');
      }
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const resendOTP = async () => {
    if (!registerData) return;

    try {
      const result = await dispatch(register(registerData)).unwrap();
      if (result.success) {
        message.success('Mã OTP mới đã được gửi!');
      }
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const steps = [
    {
      title: 'Thông tin cá nhân',
      content: (
        <Form
          name="register"
          onFinish={onFinishStep1}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="firstName"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập họ của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập tên của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Nhập số điện thoại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            initialValue="staff"
          >
            <Select size="large">
              <Option value="staff">Nhân viên</Option>
              <Option value="driver">Tài xế</Option>
              <Option value="manager">Quản lý</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ width: '100%' }}
            >
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Xác thực OTP',
      content: (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text>
              Mã OTP đã được gửi đến email: <strong>{registerData?.email}</strong>
            </Text>
          </div>

          <Form
            name="verifyOTP"
            onFinish={onFinishStep2}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="otp"
              label="Mã OTP"
              rules={[
                { required: true, message: 'Vui lòng nhập mã OTP!' },
                { len: 6, message: 'Mã OTP phải có 6 ký tự!' }
              ]}
            >
              <Input 
                prefix={<SafetyOutlined />} 
                placeholder="Nhập mã OTP 6 số"
                size="large"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ width: '100%' }}
              >
                Xác thực
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Không nhận được mã?{' '}
                <Button type="link" onClick={resendOTP} disabled={loading}>
                  Gửi lại
                </Button>
              </Text>
            </div>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 500, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
            Hệ thống Quản lý Logistic
          </Title>
          <Text type="secondary">Đăng ký tài khoản mới</Text>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div>{steps[currentStep].content}</div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: '#1890ff' }}>
              Đăng nhập
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;

