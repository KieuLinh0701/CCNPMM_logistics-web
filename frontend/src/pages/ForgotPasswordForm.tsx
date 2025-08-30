import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { forgotPassword, verifyResetOTP, resetPassword, clearError } from '../store/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import bg1 from "../assets/images/bg-1.jpg";

const { Title, Text } = Typography;

const ForgotPasswordForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
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

  // Step 1: Email
  const handleEmailSubmit = async (values: { email: string }) => {
    try {
      const result = await dispatch(forgotPassword(values)).unwrap();
      if (result.success) {
        setEmail(values.email);
        setCurrentStep(1);
        message.success('Mã OTP đã được gửi đến email của bạn!');
        setOtpCountdown(300);
        setCanResend(false);
      }
    } catch {}
  };

  // Step 2: OTP
  const handleOtpSubmit = async (values: { otp: string }) => {
    try {
      const result = await dispatch(verifyResetOTP({ email, otp: values.otp })).unwrap();
      if (result.success) {
        setCurrentStep(2);
        message.success('Xác thực OTP thành công!');
      }
    } catch {}
  };

  const handleResendOTP = async () => {
    if (!email) return;
    try {
      const result = await dispatch(forgotPassword({ email })).unwrap();
      if (result.success) {
        message.success('Mã OTP mới đã được gửi đến email của bạn!');
        setOtpCountdown(300);
        setCanResend(false);
      }
    } catch {}
  };

  // Step 3: Reset Password
  const handleResetPassword = async (values: { newPassword: string }) => {
    try {
      const result = await dispatch(resetPassword({ email, newPassword: values.newPassword })).unwrap();
      if (result.success) {
        message.success('Đặt lại mật khẩu thành công!');
        navigate('/login');
      }
    } catch {}
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
            <Input prefix={<MailOutlined style={{ color: "#1C3D90" }}/>} placeholder="Nhập email của bạn" size="large" style={{
                      backgroundColor: "#f5f7fb",
                      borderRadius: 8,
                    }}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} 
            style={{
                      width: "100%",
                      height: 45,
                      backgroundColor: "#1C3D90",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}>
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
            <Input prefix={<SafetyOutlined style={{ color: "#1C3D90" }}/>} placeholder="Nhập mã OTP" size="large" maxLength={6} style={{
                      backgroundColor: "#f5f7fb",
                      borderRadius: 8,
                    }}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{
                      width: "100%",
                      height: 45,
                      backgroundColor: "#1C3D90",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}>
              Xác thực
            </Button>
          </Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8, // khoảng cách giữa 2 phần
              marginTop: 16,
            }}
          >
            <Text>
              Mã OTP hết hạn sau{" "}
              {Math.floor(otpCountdown / 60)}:
              {String(otpCountdown % 60).padStart(2, "0")}
            </Text>

            {canResend ? (
              <Button type="link" style={{ color: "#1C3D90", fontWeight: 500 }} onClick={handleResendOTP}>Gửi lại</Button>
            ) : (
              <span style={{ color: "#999" }}>Gửi lại</span>
            )}
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
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: "#1C3D90" }}/>} placeholder="Nhập mật khẩu mới" size="large" style={{
                      backgroundColor: "#f5f7fb",
                      borderRadius: 8,
                    }}/>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{
                      width: "100%",
                      height: 45,
                      backgroundColor: "#1C3D90",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}>
              Đặt mật khẩu
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#1C3D90",
        padding: 20,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 1100,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: "flex", minHeight: 550 }}>
          {/* Left Column - Image */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
              backgroundColor: "#fff",
            }}
          >
            <img
              src={bg1}
              alt="Forgot password"
              style={{
                width: "85%",
                maxWidth: 400,
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Right Column - Form */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 50px",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ width: "100%", maxWidth: 500 }}>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <Title level={2} style={{ color: "#1C3D90", margin: 0 }}>
                  My Website
                </Title>
                <Text type="secondary">Làm theo các bước để đặt lại mật khẩu</Text>
              </div>

              <Steps current={currentStep} style={{ marginBottom: 24 }}>
                {steps.map((item) => (
                  <Steps.Step key={item.title} title={item.title} />
                ))}
              </Steps>

              {steps[currentStep].content}

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Text>
                  Nhớ mật khẩu?{" "}
                  <Link to="/login" style={{ color: "#1C3D90" }}>
                    Đăng nhập
                  </Link>
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;