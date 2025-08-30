import React from "react";
import { Layout, Button, Space, Typography, Avatar, Dropdown, Menu } from "antd";
import { UserOutlined, LogoutOutlined, ProfileOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
}

const Header: React.FC<HeaderProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // xoá user, token, isAuthenticated + localStorage
    navigate("/login"); // chuyển về trang login
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
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
        background: "#096dd9", // xanh trầm hơn
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {/* Góc trái - Tên website */}
      <Text strong style={{ fontSize: "18px", color: "#fff" }}>
        MyWebsite
      </Text>

      {/* Góc phải */}
      <Space size="middle">
        <Button
          type="primary"
          ghost
          style={{ borderColor: "#fff", color: "#fff" }}
          icon={<PlusOutlined />}
        >
          Tạo đơn hàng
        </Button>

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer", color: "#fff" }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
            <Text style={{ color: "#fff" }}>Kiều Linh</Text>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;