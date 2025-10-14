import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, message, Spin } from "antd";
import { 
  EnvironmentOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  GlobalOutlined,
  TeamOutlined,
  TrophyOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

interface CompanyInfoData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

const CompanyInfo: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await axios.get('/api/public/company-info');
        if ((response.data as any).success) {
          setCompanyInfo((response.data as any).data);
        }
      } catch (error) {
        message.error("Không thể tải thông tin công ty");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
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

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Về chúng tôi
        </Title>

        {companyInfo && (
          <Card style={{ marginBottom: 32 }}>
            <Row gutter={[32, 32]}>
              <Col span={24}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <Title level={3} style={{ color: "#1C3D90" }}>
                    {companyInfo.name}
                  </Title>
                  <Paragraph style={{ fontSize: 16, color: "#666" }}>
                    {companyInfo.description}
                  </Paragraph>
                </div>
              </Col>

              <Col span={24}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                      <EnvironmentOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                      <div>
                        <Text strong>Địa chỉ:</Text>
                        <br />
                        <Text>{companyInfo.address}</Text>
                      </div>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                      <PhoneOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                      <div>
                        <Text strong>Hotline:</Text>
                        <br />
                        <Text>{companyInfo.phone}</Text>
                      </div>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                      <MailOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                      <div>
                        <Text strong>Email:</Text>
                        <br />
                        <Text>{companyInfo.email}</Text>
                      </div>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                      <GlobalOutlined style={{ fontSize: 20, color: "#1C3D90", marginRight: 12 }} />
                      <div>
                        <Text strong>Website:</Text>
                        <br />
                        <Text>{companyInfo.website}</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        )}

        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card style={{ textAlign: "center", height: "100%" }}>
              <TeamOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
              <Title level={4}>Đội ngũ chuyên nghiệp</Title>
              <Paragraph>
                Với đội ngũ nhân viên giàu kinh nghiệm và chuyên nghiệp, chúng tôi cam kết mang đến 
                dịch vụ vận chuyển tốt nhất cho khách hàng.
              </Paragraph>
            </Card>
          </Col>

          <Col span={8}>
            <Card style={{ textAlign: "center", height: "100%" }}>
              <TrophyOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
              <Title level={4}>Chất lượng dịch vụ</Title>
              <Paragraph>
                Chúng tôi luôn đặt chất lượng dịch vụ lên hàng đầu, đảm bảo hàng hóa được vận chuyển 
                an toàn và đúng thời gian.
              </Paragraph>
            </Card>
          </Col>

          <Col span={8}>
            <Card style={{ textAlign: "center", height: "100%" }}>
              <SafetyOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
              <Title level={4}>An toàn & Bảo mật</Title>
              <Paragraph>
                Hệ thống bảo mật hiện đại và quy trình vận chuyển chặt chẽ đảm bảo hàng hóa của bạn 
                luôn được bảo vệ tốt nhất.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Tầm nhìn & Sứ mệnh
          </Title>
          
          <Row gutter={[32, 32]}>
            <Col span={12}>
              <Title level={4} style={{ color: "#1C3D90" }}>Tầm nhìn</Title>
              <Paragraph>
                Trở thành công ty vận chuyển hàng đầu Việt Nam, được khách hàng tin tưởng và lựa chọn 
                với dịch vụ chất lượng cao, giá cả hợp lý.
              </Paragraph>
            </Col>

            <Col span={12}>
              <Title level={4} style={{ color: "#1C3D90" }}>Sứ mệnh</Title>
              <Paragraph>
                Cung cấp dịch vụ vận chuyển nhanh chóng, an toàn và tiện lợi, góp phần kết nối 
                mọi miền đất nước và thúc đẩy thương mại điện tử phát triển.
              </Paragraph>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Giá trị cốt lõi
          </Title>
          
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Title level={5} style={{ color: "#1C3D90" }}>Tin cậy</Title>
                <Text>Đáng tin cậy trong mọi giao dịch</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Title level={5} style={{ color: "#1C3D90" }}>Nhanh chóng</Title>
                <Text>Giao hàng nhanh, đúng hẹn</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Title level={5} style={{ color: "#1C3D90" }}>An toàn</Title>
                <Text>Bảo vệ hàng hóa tối đa</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: "center" }}>
                <Title level={5} style={{ color: "#1C3D90" }}>Chuyên nghiệp</Title>
                <Text>Dịch vụ chuyên nghiệp, tận tâm</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <FooterHome />
    </div>
  );
};

export default CompanyInfo;
