import React from 'react';
import { Layout, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { EnvironmentOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const FooterHome: React.FC = () => {
  const aboutLinks = [
    { key: 'about', label: <Link to="/about">Giới thiệu</Link> },
    { key: 'contact', label: <Link to="/contact">Liên hệ</Link> },
    { key: 'services', label: <Link to="/services">Dịch vụ</Link> },
  ];

  return (
    <AntFooter style={{ backgroundColor: '#1C3D90', color: '#f0f0f0', padding: '60px 90px' }}>
      
      {/* Title đứng trên cùng */}
      <Row>
        <Col>
          <Title level={2} style={{ color: '#fff', margin: 0, fontSize: '40px' }}>My Website</Title>
        </Col>
      </Row>

      <hr style={{
        border: 'none',
        height: '1px',
        backgroundColor: '#fff',
        marginTop: '20px',
        marginBottom: '40px'
        }} />

      {/* 3 cột ngang, nép trái */}
      <Row justify="start" gutter={[40, 32]} align="top">
        {/* Trái: Mô tả */}
        <Col xs={24} sm={24} md={10}>
            <Text style={{ color: '#e1ddddff', fontSize: '15px', lineHeight: '1.8', marginTop: '20px' }}>
                Chúng tôi cung cấp dịch vụ chất lượng cao, uy tín và<br/>
                tận tâm, luôn mang lại giá trị tốt nhất cho khách hàng.
                
            </Text>
            </Col>

        {/* Giữa: About */}
        <Col xs={24} sm={24} md={6}>
          <Title level={4} style={{ color: '#fff', margin: 0, marginBottom: '12px', fontSize: '28px' }}>About</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aboutLinks.map(item => (
              <Link
                key={item.key}
                to={(item.label as any).props.to}
                style={{
                  color: '#e1ddddff',
                  fontSize: '15px',
                  fontWeight: 500,
                  transition: 'color 0.3s',
                }}
              >
                {(item.label as any).props.children}
              </Link>
            ))}
          </div>
        </Col>

        {/* Phải: Contact */}
        <Col xs={24} sm={24} md={6}>
          <Title level={4} style={{ color: '#fff', margin: 0, marginBottom: '12px', fontSize: '28px' }}>Contact</Title>
          <Text style={{ color: '#e1ddddff', fontSize: '15px'}}>
            <EnvironmentOutlined style={{ marginRight: 8 }}/> 123 Street, New York
          </Text><br />
          <Text style={{ color: '#e1ddddff', fontSize: '15px' }}>
            <MailOutlined style={{ marginRight: 8 }}/> Email@Example.com
          </Text><br />
          <Text style={{ color: '#e1ddddff', fontSize: '15px' }}>
            <PhoneOutlined style={{ marginRight: 8 }}/> +1 234 567 890
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