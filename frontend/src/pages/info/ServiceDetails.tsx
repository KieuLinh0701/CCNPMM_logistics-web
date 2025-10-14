import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, message, Spin, Tag, Button } from "antd";
import { 
  ClockCircleOutlined, 
  SafetyOutlined, 
  TruckOutlined,
  CheckCircleOutlined,
  StarOutlined
} from "@ant-design/icons";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

interface ServiceType {
  id: number;
  name: string;
  description: string;
  deliveryTime: string;
  status: string;
}

const ServiceDetails: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/public/services');
        if ((response.data as any).success) {
          setServices((response.data as any).data);
        }
      } catch (error) {
        message.error("Không thể tải thông tin dịch vụ");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div>
        <HeaderHome />
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
        <FooterHome />
      </div>
    );
  }

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('nhanh')) return <TruckOutlined />;
    if (serviceName.toLowerCase().includes('tiêu chuẩn')) return <CheckCircleOutlined />;
    if (serviceName.toLowerCase().includes('hỏa tốc')) return <StarOutlined />;
    return <TruckOutlined />;
  };

  const getServiceColor = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('nhanh')) return "#52c41a";
    if (serviceName.toLowerCase().includes('tiêu chuẩn')) return "#1890ff";
    if (serviceName.toLowerCase().includes('hỏa tốc')) return "#f5222d";
    return "#1C3D90";
  };

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Dịch vụ giao hàng
        </Title>

        <Card style={{ marginBottom: 32, textAlign: "center" }}>
          <Title level={3} style={{ color: "#1C3D90", marginBottom: 16 }}>
            Các loại dịch vụ vận chuyển
          </Title>
          <Paragraph style={{ fontSize: 16, color: "#666" }}>
            Chúng tôi cung cấp đa dạng các loại dịch vụ vận chuyển để đáp ứng mọi nhu cầu của khách hàng, 
            từ giao hàng nhanh đến giao hàng tiêu chuẩn với giá cả hợp lý.
          </Paragraph>
        </Card>

        <Row gutter={[24, 24]}>
          {services && services.map((service) => (
            <Col span={24} key={service.id}>
              <Card>
                <Row gutter={[24, 24]} align="middle">
                  <Col span={2}>
                    <div style={{ 
                      fontSize: 48, 
                      color: getServiceColor(service.name),
                      textAlign: "center"
                    }}>
                      {getServiceIcon(service.name)}
                    </div>
                  </Col>

                  <Col span={16}>
                    <div>
                      <Title level={3} style={{ margin: 0, color: "#1C3D90" }}>
                        {service.name}
                      </Title>
                      <Paragraph style={{ fontSize: 16, marginTop: 8 }}>
                        {service.description}
                      </Paragraph>
                      
                      <div style={{ marginTop: 16 }}>
                        <Tag 
                          icon={<ClockCircleOutlined />} 
                          color={getServiceColor(service.name)}
                          style={{ fontSize: 14, padding: "4px 12px" }}
                        >
                          Thời gian giao: {service.deliveryTime}
                        </Tag>
                      </div>
                    </div>
                  </Col>

                  <Col span={6}>
                    <div style={{ textAlign: "right" }}>
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ 
                          background: getServiceColor(service.name),
                          borderColor: getServiceColor(service.name),
                          marginBottom: 8
                        }}
                        onClick={() => window.location.href = '/tracking/shipping-fee'}
                      >
                        Tính phí
                      </Button>
                      <br />
                      <Button 
                        size="large"
                        onClick={() => window.location.href = '/tracking/order-tracking'}
                      >
                        Tra cứu
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Ưu điểm dịch vụ
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <SafetyOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
                <Title level={4}>An toàn tuyệt đối</Title>
                <Paragraph>
                  Hàng hóa được đóng gói cẩn thận và vận chuyển an toàn với 
                  hệ thống theo dõi 24/7.
                </Paragraph>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <ClockCircleOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
                <Title level={4}>Giao hàng đúng hẹn</Title>
                <Paragraph>
                  Cam kết giao hàng đúng thời gian đã hẹn với tỷ lệ thành công 
                  lên đến 99.5%.
                </Paragraph>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <TruckOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
                <Title level={4}>Mạng lưới rộng</Title>
                <Paragraph>
                  Hệ thống bưu cục và trung tâm phân phối trải rộng khắp 
                  cả nước.
                </Paragraph>
              </div>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Quy trình vận chuyển
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: "50%", 
                  background: "#1C3D90", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: 24, 
                  margin: "0 auto 16px" 
                }}>
                  1
                </div>
                <Title level={5}>Tiếp nhận</Title>
                <Text>Nhận hàng tại bưu cục hoặc lấy tận nơi</Text>
              </div>
            </Col>

            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: "50%", 
                  background: "#1C3D90", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: 24, 
                  margin: "0 auto 16px" 
                }}>
                  2
                </div>
                <Title level={5}>Xử lý</Title>
                <Text>Kiểm tra, đóng gói và phân loại hàng hóa</Text>
              </div>
            </Col>

            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: "50%", 
                  background: "#1C3D90", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: 24, 
                  margin: "0 auto 16px" 
                }}>
                  3
                </div>
                <Title level={5}>Vận chuyển</Title>
                <Text>Vận chuyển đến bưu cục đích an toàn</Text>
              </div>
            </Col>

            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: "50%", 
                  background: "#1C3D90", 
                  color: "white", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: 24, 
                  margin: "0 auto 16px" 
                }}>
                  4
                </div>
                <Title level={5}>Giao hàng</Title>
                <Text>Giao hàng tận nơi cho người nhận</Text>
              </div>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Hàng hóa được vận chuyển
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div>
                <Title level={4} style={{ color: "#52c41a" }}>Hàng hóa được chấp nhận</Title>
                <ul style={{ fontSize: 16, lineHeight: 2 }}>
                  <li>Hàng hóa thông thường (quần áo, giày dép, mỹ phẩm...)</li>
                  <li>Điện tử, điện lạnh (đã đóng gói cẩn thận)</li>
                  <li>Thực phẩm khô, đồ uống</li>
                  <li>Tài liệu, sách vở</li>
                  <li>Hàng hóa có giá trị dưới 10 triệu VNĐ</li>
                </ul>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Title level={4} style={{ color: "#f5222d" }}>Hàng hóa từ chối</Title>
                <ul style={{ fontSize: 16, lineHeight: 2 }}>
                  <li>Hàng hóa nguy hiểm (chất nổ, chất độc hại...)</li>
                  <li>Hàng hóa dễ vỡ không đóng gói đúng cách</li>
                  <li>Thực phẩm tươi sống, dễ hỏng</li>
                  <li>Tiền mặt, vàng bạc, đá quý</li>
                  <li>Hàng hóa vi phạm pháp luật</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <FooterHome />
    </div>
  );
};

export default ServiceDetails;
