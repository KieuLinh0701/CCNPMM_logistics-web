import React, { useState } from 'react';
import { Layout, Menu, Button, Row, Col, Typography, Drawer, Avatar, Dropdown } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DashboardOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd/lib';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const HeaderHome: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => setDrawerVisible(!drawerVisible);

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") as string)
    : null;

  const capitalize = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login"); 
  };

  // Tạo menu cho dropdown
  const avatarMenu: MenuProps["items"] = [
    {
      key: "dashboard",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DashboardOutlined style={{ color: "#1C3D90" }} />
          Trang quản lý
        </span>
      ),
      onClick: () => navigate(getDashboardPath(user.role)),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoutOutlined style={{ color: "#ff4d4f" }} />
          Logout
        </span>
      ),
      danger: true,
      onClick: handleLogout,
    },
  ];

  const getDashboardPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "manager":
        return "/manager/dashboard";
      case "user":
        return "/user/dashboard";
      case "driver":
        return "/driver/dashboard";
      case "shipper":
        return "/shipper/dashboard";
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

              <Menu.SubMenu key="services" title="Dịch vụ">
                <Menu.Item key="/services/standard">
                  <Link to="/services/standard">Giao hàng tiêu chuẩn</Link>
                </Menu.Item>
                <Menu.Item key="/services/fast">
                  <Link to="/services/fast">Giao hàng nhanh</Link>
                </Menu.Item>
                <Menu.Item key="/services/super-fast">
                  <Link to="/services/super-fast">Hỏa tốc</Link>
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu key="tracking" title="Tra cứu">
                <Menu.Item key="/tracking/shipping-fee">
                  <Link to="/tracking/shipping-fee">Cước vận chuyển</Link>
                </Menu.Item>
                <Menu.Item key="/tracking/office">
                  <Link to="/tracking/office">Bưu cục</Link>
                </Menu.Item>
                <Menu.Item key="/tracking/order">
                  <Link to="/tracking/order">Vận đơn</Link>
                </Menu.Item>
                <Menu.Item key="/tracking/price-list">
                  <Link to="/tracking/price-list">Bảng giá</Link>
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.Item key="/promotions"><Link to="/promotions">Khuyến mãi</Link></Menu.Item>
              <Menu.Item key="/about"><Link to="/about">Giới thiệu</Link></Menu.Item>
              <Menu.Item key="/contact"><Link to="/contact">Liên hệ</Link></Menu.Item>
            </Menu>
          </Col>

          {/* Buttons + Hamburger */}
          <Col style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? (
              <Dropdown menu={{ items: avatarMenu }} placement="bottomRight" trigger={['click']}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <Avatar
                    size="default"
                    style={{ backgroundColor: "#1C3D90" }}
                    icon={<UserOutlined style={{ color: "#f5f5f5" }} />}
                  />
                  <span style={{ color: "#000" }}>
                    {user?.firstName && user?.lastName
                      ? `${capitalize(user.lastName)} ${capitalize(user.firstName)}`
                      : "User"}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <>
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
              </>
            )}

            {/* Nút mở Drawer (mobile) */}
            <Button
              className="mobile-menu-btn"
              type="text"
              onClick={toggleDrawer}
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              }
            />
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

          {/* Dịch vụ */}
          <Menu.ItemGroup title="Dịch vụ">
            <Menu.Item key="/services/standard">
              <Link to="/services/standard">Giao hàng tiêu chuẩn</Link>
            </Menu.Item>
            <Menu.Item key="/services/fast">
              <Link to="/services/fast">Giao hàng nhanh</Link>
            </Menu.Item>
            <Menu.Item key="/services/super-fast">
              <Link to="/services/super-fast">Hỏa tốc</Link>
            </Menu.Item>
          </Menu.ItemGroup>

          {/* Tra cứu */}
          <Menu.ItemGroup title="Tra cứu">
            <Menu.Item key="/tracking/shipping-fee">
              <Link to="/tracking/shipping-fee">Cước vận chuyển</Link>
            </Menu.Item>
            <Menu.Item key="/tracking/office">
              <Link to="/tracking/office">Bưu cục</Link>
            </Menu.Item>
            <Menu.Item key="/tracking/order">
              <Link to="/tracking/order">Vận đơn</Link>
            </Menu.Item>
            <Menu.Item key="/tracking/price-list">
              <Link to="/tracking/price-list">Bảng giá</Link>
            </Menu.Item>
          </Menu.ItemGroup>
          
          <Menu.Item key="/promotions"><Link to="/promotions">Khuyến mãi</Link></Menu.Item>
          <Menu.Item key="/about"><Link to="/about">Giới thiệu</Link></Menu.Item>
          <Menu.Item key="/contact"><Link to="/contact">Liên hệ</Link></Menu.Item>
        </Menu>
      </Drawer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        .custom-menu .ant-menu-item a,
        .custom-menu .ant-menu-submenu-title,
        .custom-menu .ant-menu-submenu .ant-menu-item a {
          font-weight: 500;
          font-size: 15px;
          color: #5b5a5aff;
          transition: all 0.3s;
        }
        .custom-menu .ant-menu-item-selected a,
        .custom-menu .ant-menu-submenu .ant-menu-item-selected a {
          color: #1C3D90;
        }
        .custom-menu .ant-menu-item a:hover,
        .custom-menu .ant-menu-submenu-title:hover {
          color: #1890ff;
        }
      `}</style>
    </AntHeader>
  );
};

export default HeaderHome;