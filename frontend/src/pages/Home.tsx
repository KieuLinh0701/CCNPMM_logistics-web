import React from 'react';
import { Typography, Row, Col, Card, Button } from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  InfoCircleOutlined,
  TruckOutlined,
  PhoneOutlined,
  FileTextOutlined,
  StarOutlined
} from '@ant-design/icons';
import HeaderHome from '../components/header/HeaderHome';
import FooterHome from '../components/footer/FooterHome';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <div>
      <HeaderHome />
      
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1C3D90 0%, #2E5BBA 100%)', 
        color: 'white', 
        padding: '80px 20px',
        textAlign: 'center'
      }}>
        <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
          CCNPMM Logistics
        </Title>
        <Paragraph style={{ fontSize: 20, color: 'white', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Dịch vụ vận chuyển hàng hóa chuyên nghiệp, nhanh chóng và an toàn
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          style={{ 
            background: 'white', 
            color: '#1C3D90', 
            border: 'none',
            height: 50,
            fontSize: 16,
            fontWeight: 'bold'
          }}
          onClick={() => window.location.href = '/tracking/shipping-fee'}
        >
          Tính phí vận chuyển ngay
        </Button>
      </div>

      <div style={{ padding: '60px 20px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Tracking Services */}
        <div style={{ marginBottom: 60 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
            Tra cứu & Dịch vụ
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/tracking/order-tracking'}
              >
                <SearchOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Tra cứu đơn hàng</Title>
                <Paragraph>
                  Theo dõi trạng thái đơn hàng và lịch sử vận chuyển bằng mã vận đơn
                </Paragraph>
                <Button type="primary" style={{ background: '#1C3D90' }}>
                  Tra cứu ngay
                </Button>
              </Card>
            </Col>

            <Col span={8}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/tracking/office-search'}
              >
                <EnvironmentOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Tra cứu bưu cục</Title>
                <Paragraph>
                  Tìm kiếm bưu cục gần nhất dựa trên tỉnh/thành phố và xã/phường
                </Paragraph>
                <Button type="primary" style={{ background: '#1C3D90' }}>
                  Tìm bưu cục
                </Button>
              </Card>
            </Col>

            <Col span={8}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/tracking/shipping-fee'}
              >
                <DollarOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Tính cước phí</Title>
                <Paragraph>
                  Tính toán chi phí vận chuyển dựa trên khối lượng và khoảng cách
                </Paragraph>
                <Button type="primary" style={{ background: '#1C3D90' }}>
                  Tính phí
                </Button>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Information Services */}
        <div style={{ marginBottom: 60 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
            Thông tin & Hỗ trợ
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={6}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/info/shipping-rates'}
              >
                <FileTextOutlined style={{ fontSize: 36, color: '#1C3D90', marginBottom: 12 }} />
                <Title level={5}>Bảng giá</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  Xem bảng giá chi tiết của các dịch vụ vận chuyển
                </Paragraph>
              </Card>
            </Col>

            <Col span={6}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/info/services'}
              >
                <TruckOutlined style={{ fontSize: 36, color: '#1C3D90', marginBottom: 12 }} />
                <Title level={5}>Dịch vụ</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  Chi tiết các dịch vụ giao hàng và loại hàng từ chối
                </Paragraph>
              </Card>
            </Col>

            <Col span={6}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/info/company'}
              >
                <InfoCircleOutlined style={{ fontSize: 36, color: '#1C3D90', marginBottom: 12 }} />
                <Title level={5}>Về chúng tôi</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  Thông tin công ty và giới thiệu về doanh nghiệp
                </Paragraph>
              </Card>
            </Col>

            <Col span={6}>
              <Card 
                hoverable 
                style={{ textAlign: 'center', height: '100%' }}
                onClick={() => window.location.href = '/info/contact'}
              >
                <PhoneOutlined style={{ fontSize: 36, color: '#1C3D90', marginBottom: 12 }} />
                <Title level={5}>Liên hệ</Title>
                <Paragraph style={{ fontSize: 14 }}>
                  Thông tin liên hệ và form yêu cầu hỗ trợ
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Features */}
        <div style={{ 
          background: '#f8f9fa', 
          padding: '40px', 
          borderRadius: '12px',
          marginBottom: 60
        }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>
            Tại sao chọn CCNPMM Logistics?
          </Title>
          
          <Row gutter={[32, 32]}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <StarOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Chất lượng cao</Title>
                <Paragraph>
                  Dịch vụ vận chuyển chuyên nghiệp với tỷ lệ thành công 99.5%
                </Paragraph>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <TruckOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Nhanh chóng</Title>
                <Paragraph>
                  Giao hàng đúng hẹn với nhiều lựa chọn dịch vụ phù hợp
                </Paragraph>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ fontSize: 48, color: '#1C3D90', marginBottom: 16 }} />
                <Title level={4}>Giá cả hợp lý</Title>
                <Paragraph>
                  Bảng giá minh bạch, cạnh tranh với nhiều ưu đãi hấp dẫn
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>

        {/* CTA Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1C3D90 0%, #2E5BBA 100%)', 
          color: 'white', 
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ color: 'white', marginBottom: 16 }}>
            Cần hỗ trợ?
          </Title>
          <Paragraph style={{ fontSize: 18, color: 'white', marginBottom: 32 }}>
            Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
          </Paragraph>
          <Button 
            type="primary" 
            size="large" 
            style={{ 
              background: 'white', 
              color: '#1C3D90', 
              border: 'none',
              height: 50,
              fontSize: 16,
              fontWeight: 'bold',
              marginRight: 16
            }}
            onClick={() => window.location.href = '/info/contact'}
          >
            Liên hệ ngay
          </Button>
          <Button 
            size="large" 
            style={{ 
              background: 'transparent', 
              color: 'white', 
              border: '2px solid white',
              height: 50,
              fontSize: 16
            }}
            onClick={() => window.location.href = '/info/company'}
          >
            Về chúng tôi
          </Button>
        </div>
      </div>

      <FooterHome />
    </div>
  );
};

export default HomePage;