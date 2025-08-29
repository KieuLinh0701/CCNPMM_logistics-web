import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { forgotPassword, verifyResetOTP, resetPassword, clearError } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const ForgotPasswordForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const [otpCountdown, setOtpCountdown] = useState(300);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    let interval: NodeJS.Timer;

    if (!canResend && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [otpCountdown, canResend]);

  // Step 1: Nhập email
  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      const result = await dispatch(forgotPassword(values)).unwrap();
      if (result.success) {
        setEmail(values.email); 
        setCurrentStep(1);
        message.success('Mã OTP đã được gửi đến email của bạn!');
        setOtpCountdown(300);
      } else {
        message.error(result.message || 'Không tìm thấy tài khoản với email này!');
      }
    } catch (err) {}
  };

  // Step 2: Nhập OTP
  const handleOtpSubmit = async (values: { otp: string }) => {
    try {
      const result = await dispatch(verifyResetOTP({ email, otp: values.otp })).unwrap();
      if (result.success && result.user) {
        setOtpVerified(true);
        setCurrentStep(2);
        message.success(result.message || 'Xác thực OTP thành công!');
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'manager':
            navigate('/manager/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        message.error(result.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
      }
    } catch (err: any) {
      // Trường hợp API reject
      message.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email) return;

    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      if (result.success) {
        message.success('Mã OTP mới đã được gửi đến email của bạn!');
      }
    } catch (err: any) {
      message.error(err.message || 'Gửi lại OTP thất bại, vui lòng thử lại.');
    }
  };

  // Step 3: Đặt mật khẩu mới
  const handleResetPassword = async (values: { newPassword: string }) => {
    try {
      const result = await dispatch(resetPassword({ email, newPassword: values.newPassword })).unwrap();
      if (result.success) {
        message.success('Đặt lại mật khẩu thành công!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      message.error(err.message || 'Đặt lại mật khẩu thất bại!');
    }
  };

  const steps = [
    {
      title: 'Nhập Email',
      content: (
        <Form layout="vertical" onFinish={handleEmailSubmit} autoComplete="off">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" size="large" style={{ height: 45}}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ height: 45, width: '100%' }}>
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      title: 'Xác thực OTP',
      content: (
        <Form layout="vertical" onFinish={handleOtpSubmit} autoComplete="off">
          <Form.Item
            name="otp"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP!' },
              { len: 6, message: 'Mã OTP phải có 6 ký tự!' }
            ]}
          >
            <Input prefix={<SafetyOutlined />} placeholder="Nhập mã OTP" size="large" maxLength={6} style={{ height: 45}}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ height: 45, width: '100%' }}>
              Xác thực
            </Button>
          </Form.Item>
           <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary">
              Mã OTP sẽ hết hạn trong {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')}
              {' '}
              {canResend ? (
                <Button type="link" onClick={handleResendOTP}>
                  Gửi lại
                </Button>
              ) : (
                <span style={{ color: '#999' }}>Gửi lại</span>
              )}
            </Text>
          </div>
        </Form>
      )
    },
    {
      title: 'Đặt mật khẩu mới',
      content: (
        <Form layout="vertical" onFinish={handleResetPassword} autoComplete="off">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" size="large" style={{ height: 45}}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ height: 45, width: '100%' }}>
              Đặt mật khẩu
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)'}}>
      <Card style={{ width: 650, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>Quên mật khẩu</Title>
          <Text type="secondary">Vui lòng làm theo các bước để đặt lại mật khẩu</Text>
        </div>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((item) => <Steps.Step key={item.title} title={item.title} />)}
        </Steps>
        <div>{steps[currentStep].content}</div>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;