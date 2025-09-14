import React from "react";
import { Menu, Button } from "antd";
import { NavLink, useLocation } from "react-router-dom";

import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  BarChartOutlined,
  ToolOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

type Props = {
  color: string;
};

const Sidenav: React.FC<Props> = ({ color }) => {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  // Config menu items
  const menuItems = [
    { key: "dashboard", label: "Dashboard", path: "/admin/dashboard", icon: <DashboardOutlined /> },
    { key: "users", label: "Quản lý người dùng", path: "/admin/users", icon: <UserOutlined /> },
    { key: "postoffices", label: "Quản lý bưu cục", path: "/admin/postoffices", icon: <ShopOutlined /> },
    { key: "servicetypes", label: "Loại dịch vụ", path: "/admin/servicetypes", icon: <SettingOutlined /> },
    { key: "orders", label: "Đơn hàng", path: "/admin/orders", icon: <ShoppingCartOutlined /> },
    { key: "fees", label: "Quản lý phí", path: "/admin/fees", icon: <DollarOutlined /> },
    { key: "reports", label: "Báo cáo", path: "/admin/reports", icon: <BarChartOutlined /> },
    { key: "services", label: "Dịch vụ", path: "/admin/services", icon: <ToolOutlined /> },
    { key: "profile", label: "Hồ sơ", path: "/admin/profile", icon: <ProfileOutlined /> },
  ];

  return (
    <div className="sidenav">

      {/* Menu */}
      <Menu theme="light" mode="inline" selectedKeys={[page.replace('admin/', '')]}>
        {menuItems.map((item) => (
          <Menu.Item key={item.key} icon={item.icon}>
            <NavLink to={item.path}>{item.label}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default Sidenav;