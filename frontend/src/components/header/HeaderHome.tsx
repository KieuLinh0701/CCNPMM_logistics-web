import React, { useState } from 'react';
import { Layout, Menu, Button, Row, Col, Typography, Drawer, Avatar, Dropdown } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { Color } from 'antd/es/color-picker';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const HeaderHome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  const user = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user") as string) 
    : null;

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "manager":
        return "/manager/dashboard";
      case "staff":
        return "/staff/dashboard";
      case "driver":
        return "/driver/dashboard";
      default:
        return "/home";
    }
  };

  const handleAvatarClick = () => {
    if (user?.role) {
      navigate(getDashboardPath(user.role));
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: 0,
        width: '100%',
        height: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
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
              <Menu.Item key="/about"><Link to="/about">Giới thiệu</Link></Menu.Item>
              <Menu.Item key="/contact"><Link to="/contact">Liên hệ</Link></Menu.Item>
            </Menu>
          </Col>

          {/* Buttons hoặc User menu */}
          <Col>
            {user ? (
              <div
                onClick={handleAvatarClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <Avatar size="default" style={{ backgroundColor: "#1C3D90" }} icon={<UserOutlined style={{ color: "#f5f5f5" }} />} />
                <span style={{ color: "#000" }}>
                    {user?.firstName && user?.lastName
                      ? `${capitalize(user.firstName)} ${capitalize(user.lastName)}`
                      : "User"}
              </span>
              </div>
          ) : (
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
            )}
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
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
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