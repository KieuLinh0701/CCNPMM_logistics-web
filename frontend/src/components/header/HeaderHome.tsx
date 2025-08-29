import React, { useState } from 'react';
import { Layout, Menu, Button, Row, Col, Typography, Drawer } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const HeaderHome: React.FC = () => {
  const location = useLocation();

  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: 0,
        width: '100%',
        height: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // offset + blur hợp lý
      }}
    >
      <div style={{ padding: '0 90px', width: '100%', height: '100%' }}>
        <Row justify="space-between" align="middle" style={{ height: '100%' }}>
            {/* Logo */}
            <Col flex="200px">
                <Title
                level={2}
                style={{ margin: 0, color: '#1C3D90', lineHeight: '100px' }}
                >
                My Website
                </Title>
            </Col>

            {/* Desktop Menu */}
            <Col flex="auto" className="desktop-menu" style={{ display: 'flex', justifyContent: 'center' }}>
                <Menu
                    className="custom-menu"
                    selectedKeys={[location.pathname]}
                    mode="horizontal"
                    selectable={false}
                    style={{
                    borderBottom: 'none',
                    lineHeight: '100px',
                    width: '100%',
                    maxWidth: 'calc(100% - 400px)', 
                    }}
                    theme="light"
                > 
                <Menu.Item key="/"><Link to="/">Trang chủ</Link></Menu.Item>
                <Menu.Item key="/service"><Link to="/service">Dịch vụ</Link></Menu.Item>
                <Menu.Item key="/about"><Link to="/">Giới thiệu</Link></Menu.Item>
                <Menu.Item key="/contact"><Link to="/">Liên hệ</Link></Menu.Item>
                </Menu>
            </Col>

            {/* Buttons */}
            <Col>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {/* Nút đăng nhập/đăng ký */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/login">
                    <Button
                      style={{
                        borderRadius: 4,
                        backgroundColor: '#1C3D90',
                        borderColor: '#1C3D90',
                        color: '#fff',
                        fontWeight: 500,
                        height: 44,
                        boxShadow: 'none',
                      }}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      type="default"
                      style={{
                        borderRadius: 4,
                        backgroundColor: '#fff',
                        borderColor: '#1C3D90',
                        color: '#1C3D90',
                        fontWeight: 500,
                        height: 44,
                      }}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </div>

                {/* Hamburger icon cho mobile */}
                <Button
                  type="text"
                  icon={<MenuOutlined style={{ fontSize: 24 }} />}
                  onClick={toggleDrawer}
                  className="mobile-menu-btn"
                  style={{ marginLeft: 5 }} // khoảng cách nhỏ với nút Đăng ký
                />
              </div>
            </Col>
            </Row>
      </div>

      {/* Drawer cho menu mobile */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleDrawer}
        open={drawerVisible}
      >
        <Menu mode="vertical" selectedKeys={[location.pathname]}>
          <Menu.Item key="/"><Link to="/">Trang chủ</Link></Menu.Item>
          <Menu.Item key="/service"><Link to="/service">Dịch vụ</Link></Menu.Item>
          <Menu.Item key="/about"><Link to="/about">Giới thiệu</Link></Menu.Item>
          <Menu.Item key="/contact"><Link to="/contact">Liên hệ</Link></Menu.Item>
        </Menu>
      </Drawer>

      {/* CSS menu */}
      <style>{`
        /* Responsive */
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; } /* ẩn menu desktop */
          .mobile-menu-btn { display: inline-flex !important; } /* hiện icon hamburger */
        }

        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; } /* ẩn icon trên desktop */
        }
        .custom-menu .ant-menu-item a {
            font-weight: 500;
            font-size: 15px;
            color: #5b5a5aff;
            transition: all 0.3s;
        }
        .custom-menu .ant-menu-item-selected a {
            color: #1C3D90;
        }
        .custom-menu .ant-menu-item a:hover {
            color: #1890ff;
        }
      `}</style>
    </AntHeader>
  );
};

export default HeaderHome;