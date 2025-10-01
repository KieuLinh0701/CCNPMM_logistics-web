import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Row, Col, message, Select } from "antd";
import { SendOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ContactFormData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/public/contact', values);
      if ((response.data as any).success) {
        message.success((response.data as any).message);
        form.resetFields();
      } else {
        message.error("Có lỗi xảy ra khi gửi liên hệ");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra khi gửi liên hệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 1000, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Liên hệ & Hỗ trợ
        </Title>

        <Row gutter={[32, 32]}>
          <Col span={16}>
            <Card title="Gửi yêu cầu hỗ trợ">
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="Họ và tên"
                      rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                      <Input size="large" placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" }
                      ]}
                    >
                      <Input size="large" placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại"
                      rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                    >
                      <Input size="large" placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="subject"
                      label="Chủ đề"
                      rules={[{ required: true, message: "Vui lòng chọn chủ đề!" }]}
                    >
                      <Select size="large" placeholder="Chọn chủ đề">
                        <Option value="general">Thông tin chung</Option>
                        <Option value="shipping">Vận chuyển</Option>
                        <Option value="billing">Thanh toán</Option>
                        <Option value="complaint">Khiếu nại</Option>
                        <Option value="support">Hỗ trợ kỹ thuật</Option>
                        <Option value="other">Khác</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="message"
                  label="Nội dung"
                  rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Nhập nội dung chi tiết..."
                    style={{ fontSize: 16 }}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<SendOutlined />}
                    style={{ 
                      background: "#1C3D90", 
                      color: "white", 
                      width: "100%", 
                      height: 50, 
                      fontSize: 16 
                    }}
                  >
                    Gửi yêu cầu
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col span={8}>
            <Card title="Thông tin liên hệ">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <PhoneOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                  <div>
                    <Text strong>Hotline</Text>
                    <br />
                    <Text>1900-1234</Text>
                    <br />
                    <Text type="secondary">(24/7)</Text>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <MailOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                  <div>
                    <Text strong>Email</Text>
                    <br />
                    <Text>info@ccnpmm.com</Text>
                    <br />
                    <Text>support@ccnpmm.com</Text>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                  <EnvironmentOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12, marginTop: 4 }} />
                  <div>
                    <Text strong>Địa chỉ</Text>
                    <br />
                    <Text>123 Đường ABC, Quận XYZ</Text>
                    <br />
                    <Text>TP. Hồ Chí Minh, Việt Nam</Text>
                  </div>
                </div>
              </div>

              <div>
                <Title level={5}>Giờ làm việc</Title>
                <Text>Thứ 2 - Thứ 6: 8:00 - 17:30</Text>
                <br />
                <Text>Thứ 7: 8:00 - 12:00</Text>
                <br />
                <Text>Chủ nhật: Nghỉ</Text>
              </div>
            </Card>

            <Card title="Hỗ trợ nhanh" style={{ marginTop: 16 }}>
              <div>
                <Button 
                  type="primary" 
                  block 
                  style={{ marginBottom: 8, background: "#1C3D90" }}
                  onClick={() => window.open('tel:1900-1234')}
                >
                  Gọi hotline
                </Button>
                
                <Button 
                  block 
                  style={{ marginBottom: 8 }}
                  onClick={() => window.open('mailto:info@ccnpmm.com')}
                >
                  Gửi email
                </Button>
                
                <Button 
                  block
                  onClick={() => window.open('https://www.facebook.com/ccnpmm', '_blank')}
                >
                  Facebook
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Câu hỏi thường gặp
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div>
                <Title level={5}>Làm thế nào để tra cứu đơn hàng?</Title>
                <Text>
                  Bạn có thể tra cứu đơn hàng bằng mã vận đơn trên trang chủ hoặc 
                  sử dụng tính năng "Tra cứu đơn hàng".
                </Text>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Title level={5}>Thời gian giao hàng là bao lâu?</Title>
                <Text>
                  Thời gian giao hàng phụ thuộc vào loại dịch vụ và khoảng cách. 
                  Giao hàng nhanh: 1-2 ngày, Giao hàng tiêu chuẩn: 3-5 ngày.
                </Text>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Title level={5}>Có thể hủy đơn hàng không?</Title>
                <Text>
                  Bạn có thể hủy đơn hàng trong vòng 2 giờ sau khi tạo đơn. 
                  Liên hệ hotline để được hỗ trợ.
                </Text>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Title level={5}>Phí vận chuyển được tính như thế nào?</Title>
                <Text>
                  Phí vận chuyển được tính dựa trên khối lượng, khoảng cách và 
                  loại dịch vụ. Sử dụng công cụ tính phí để biết chi tiết.
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <FooterHome />
    </div>
  );
};

export default ContactForm;
