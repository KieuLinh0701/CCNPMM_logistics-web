import React from "react";
import { Menu, Button } from "antd";
import { NavLink, useLocation } from "react-router-dom";

import {
  DashboardOutlined,
  TableOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

type Props = {
  color: string;
};

const Sidenav: React.FC<Props> = ({ color }) => {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "");

  // Config menu items
  const menuItems = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: <DashboardOutlined /> },
    { key: "tables", label: "Tables", path: "/tables", icon: <TableOutlined /> },
    { key: "billing", label: "Billing", path: "/billing", icon: <CreditCardOutlined /> },
    { key: "rtl", label: "RTL", path: "/rtl", icon: <GlobalOutlined /> },
    { key: "profile", label: "Profile", path: "/profile", icon: <UserOutlined /> },
    { key: "sign-in", label: "Sign In", path: "/sign-in", icon: <LoginOutlined /> },
    { key: "sign-up", label: "Sign Up", path: "/sign-up", icon: <UserAddOutlined /> },
  ];

  return (
    <div className="sidenav">

      {/* Menu */}
      <Menu theme="light" mode="inline" selectedKeys={[page]}>
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