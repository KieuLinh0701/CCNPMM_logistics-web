import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const FooterHome: React.FC = () => {
  const aboutLinks = [
    { key: 'about', label: <Link to="/info/company">Về chúng tôi</Link> },
    { key: 'contact', label: <Link to="/info/contact">Liên hệ</Link> },
    { key: 'consulting', label: <Link to="/consulting">Tư vấn</Link> },
  ];

  return (
    <AntFooter style={{ backgroundColor: '#E0E0E0', color: '#f0f0f0', padding: '60px 90px' }}>
      
      {/* Title đứng trên cùng */}
      <Row>
        <Col>
          <Title level={3} style={{ color: '#1C3D90', margin: 0, fontSize: '40px' }}>UTE Logistics</Title>
        </Col>
      </Row>

      <hr style={{
        border: 'none',
        height: '1px',
        backgroundColor: '#000',
        marginTop: '20px',
        marginBottom: '40px'
        }} />

      {/* 3 cột ngang, nép trái */}
      <Row justify="start" gutter={[40, 32]} align="top">
        {/* Trái: Mô tả */}
        <Col xs={24} sm={24} md={10}>
            <Text style={{ color: '#7A7A7A', fontSize: '15px', lineHeight: '1.8', marginTop: '20px' }}>
                Chúng tôi cung cấp dịch vụ chất lượng cao, uy tín và<br/>
                tận tâm, luôn mang lại giá trị tốt nhất cho khách hàng.
                
            </Text>
            </Col>

        {/* Giữa: About */}
        <Col xs={24} sm={24} md={6}>
          <Title level={5} style={{ color: '#000', margin: 0, marginBottom: '12px', fontSize: '28px' }}>About</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aboutLinks.map(item => (
              <Link
                key={item.key}
                to={(item.label as any).props.to}
                style={{ color: '#7A7A7A', fontSize: '15px' }}
              >
                {(item.label as any).props.children}
              </Link>
            ))}
          </div>
        </Col>

        {/* Phải: Contact */}
        <Col xs={24} sm={24} md={6}>
          <Title level={5} style={{ color: '#000', margin: 0, marginBottom: '12px', fontSize: '28px' }}>Contact</Title>
          <Text style={{ color: '#7A7A7A', fontSize: '15px'}}>
            <EnvironmentOutlined style={{ marginRight: 8 }}/> 01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam
          </Text><br />
          <Text style={{ color: '#7A7A7A', fontSize: '15px' }}>
            <MailOutlined style={{ marginRight: 8 }}/> kieulinh@gmail.com
          </Text><br />
          <Text style={{ color: '#7A7A7A', fontSize: '15px' }}>
            <PhoneOutlined style={{ marginRight: 8 }}/> +84 123 4556 789
          </Text>
        </Col>

      </Row>

      {/* Footer nhỏ */}
      <Row justify="center" style={{ marginTop: '40px' }}>
        <Text style={{ color: '#8c8c8c', fontSize: '13px' }}>© 2025 My Website. All rights reserved.</Text>
      </Row>

      <style>{`
        a:hover {
          color: #40a9ff;
        }
      `}</style>
    </AntFooter>
  );
};

export default FooterHome;