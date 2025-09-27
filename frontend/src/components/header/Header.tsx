import React from "react";
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined, ProfileOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = user?.firstName || user?.lastName
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : (user?.email || 'User');

  const handleLogout = () => {
    dispatch(logout()); 
    navigate("/login"); 
  };

  const handleProfile = () => {
    if (user?.role) {
      navigate(`/${user.role}/profile`);
    } else {
      navigate("/profile"); 
    }
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str
      .split(" ")
      .filter(Boolean) 
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />} onClick={handleProfile}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader
      style={{
        background: "#1C3D90", // xanh trầm hơn
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Góc trái - Tên website */}
      <Link to="/home">
        <Text strong style={{ fontSize: "18px", color: "#fff" }}>
          MyWebsite
        </Text>
      </Link>

      {/* Góc phải */}
      <Space size="middle">
        {user?.role === "manager" && (
          <Button
            type="primary"
            ghost
            style={{ borderColor: "#fff", color: "#fff" }}
            icon={<PlusOutlined />}
            onClick={() => navigate("/manager/orders/create")}
          >
            Tạo đơn hàng
          </Button>
        )}

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer", color: "#fff" }}>
            <Avatar icon={<UserOutlined />} 
            style={{
              background: "linear-gradient(135deg, #3a7bd5, #00d2ff)",
              color: "#fff",
              fontWeight: "bold",
            }}/>
            <Text style={{ color: "#fff" }}>
              {user?.firstName && user?.lastName
                ? `${capitalize(user.lastName)} ${capitalize(user.firstName)}`
                : "User"}
            </Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;