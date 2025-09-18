import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  TableOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  UserOutlined,
  LoginOutlined,
  UserAddOutlined,
  ShoppingOutlined,
  CarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { SubMenu } = Menu;

type MenuItem = {
  key: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
};

type Props = {
  color: string;
};

const Sidenav: React.FC<Props> = ({ color }) => {
  const { pathname } = useLocation();

  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";

  // Config menu theo role
  const menuConfig: Record<string, MenuItem[]> = {
    admin: [
      {
        key: "/manager/dashboard",
        label: "Báo cáo & Thống kê",
        path: "/manager/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "/tables",
        label: "Tables",
        path: "/tables",
        icon: <TableOutlined />,
      },
      {
        key: "/billing",
        label: "Billing",
        path: "/billing",
        icon: <CreditCardOutlined />,
      },
      {
        key: "orders",
        label: "Quản lý đơn hàng",
        icon: <ShoppingOutlined />,
        children: [
          {
            key: "/orders/list",
            label: "Danh sách đơn hàng",
            path: "/orders/list",
          },
          {
            key: "/orders/history",
            label: "Lịch sử đơn hàng",
            path: "/orders/history",
          },
        ],
      },
    ],
    manager: [
      {
        key: "/manager/dashboard",
        label: "Báo cáo & Thống kê",
        path: "/manager/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "orders",
        label: "Quản lý đơn hàng",
        icon: <ShoppingOutlined />,
        children: [
          {
            key: "/manager/orders/list",
            label: "Danh sách đơn hàng",
            path: "/manager/orders/list",
          },
          {
            key: "/manager/orders/assign",
            label: "Phân công đơn hàng",
            path: "/manager/orders/assign",
          },
        ],
      },
      {
        key: "/manager/support",
        label: "Hỗ trợ & Khiếu nại",
        path: "/manager/support",
        icon: <GlobalOutlined />,
      },
      {
        key: "staff",
        label: "Quản lý nhân sự",
        icon: <TeamOutlined />,
        children: [
          {
            key: "/manager/employees/list",
            label: "Danh sách nhân viên",
            path: "/manager/employees/list",
          },
          {
            key: "/manager/staff/assign",
            label: "Phân công công việc",
            path: "/manager/staff/assign",
          },
        ],
      },
      {
        key: "/manager/office",
        label: "Thông tin bưu cục",
        path: "/manager/office",
        icon: <HomeOutlined />,
      },
      {
        key: "/manager/warehouse",
        label: "Đơn nhập/xuất kho",
        path: "/manager/warehouse",
        icon: <DatabaseOutlined />,
      },
      {
        key: "finance",
        label: "Quản lý dòng tiền",
        icon: <DollarOutlined />,
        children: [
          {
            key: "/manager/finance/tracking",
            label: "Theo dõi thu - chi",
            path: "/manager/finance/tracking",
          },
          {
            key: "/manager/finance/confirm",
            label: "Xác nhận đối soát",
            path: "/manager/finance/confirm",
          },
          {
            key: "/manager/finance/history",
            label: "Lịch sử đối soát",
            path: "/manager/finance/history",
          },
        ],
      },
      {
        key: "vehicles",
        label: "Quản lý phương tiện",
        icon: <CarOutlined />,
        children: [
          {
            key: "/manager/vehicles/list",
            label: "Danh sách phương tiện",
            path: "/manager/vehicles/list",
          },
          {
            key: "/manager/vehicles/maintenance",
            label: "Lịch bảo dưỡng",
            path: "/manager/vehicles/maintenance",
          },
          {
            key: "/manager/vehicles/history",
            label: "Lịch sử bảo dưỡng",
            path: "/manager/vehicles/history",
          },
          {
            key: "/manager/vehicles/finance",
            label: "Dòng tiền phương tiện",
            path: "/manager/vehicles/finance",
          },
        ],
      },
    ],
    user: [
      {
        key: "/user/dashboard",
        label: "Báo cáo & Thống kê",
        path: "/user/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "orders",
        label: "Quản lý đơn hàng",
        icon: <ShoppingOutlined />,
        children: [
          {
            key: "/user/orders/list",
            label: "Danh sách đơn hàng",
            path: "/user/orders/list",
          },
          {
            key: "/user/orders/assign",
            label: "Phân công đơn hàng",
            path: "/user/orders/assign",
          },
        ],
      },
      {
        key: "/user/support",
        label: "Hỗ trợ & Khiếu nại",
        path: "/user/support",
        icon: <GlobalOutlined />,
      },
      {
        key: "staff",
        label: "Quản lý nhân sự",
        icon: <TeamOutlined />,
        children: [
          {
            key: "/user/employees/list",
            label: "Danh sách nhân viên",
            path: "/user/employees/list",
          },
          {
            key: "/user/staff/assign",
            label: "Phân công công việc",
            path: "/user/staff/assign",
          },
        ],
      },
      {
        key: "/user/office",
        label: "Thông tin bưu cục",
        path: "/user/office",
        icon: <HomeOutlined />,
      },
      {
        key: "/user/warehouse",
        label: "Đơn nhập/xuất kho",
        path: "/user/warehouse",
        icon: <DatabaseOutlined />,
      },
      {
        key: "finance",
        label: "Quản lý dòng tiền",
        icon: <DollarOutlined />,
        children: [
          {
            key: "/user/finance/tracking",
            label: "Theo dõi thu - chi",
            path: "/user/finance/tracking",
          },
          {
            key: "/user/finance/confirm",
            label: "Xác nhận đối soát",
            path: "/user/finance/confirm",
          },
          {
            key: "/user/finance/history",
            label: "Lịch sử đối soát",
            path: "/user/finance/history",
          },
        ],
      },
    ],
  };

  const menuItems = menuConfig[role] || menuConfig.user;

  // Mở submenu tự động khi vào đúng path
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  useEffect(() => {
    const keys: string[] = [];
    menuItems.forEach((item) => {
      if (item.children?.some((child) => child.key === pathname)) {
        keys.push(item.key);
      }
    });
    setOpenKeys(keys);
  }, [pathname]);

  return (
    <div className="sidenav">
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[pathname]} // dùng pathname thay vì page
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
      >
        {menuItems.map((item) =>
          item.children ? (
            <SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.children.map((child: MenuItem) => (
                <Menu.Item key={child.key} icon={child.icon}>
                  <NavLink to={child.path || "#"}>{child.label}</NavLink>
                </Menu.Item>
              ))}
            </SubMenu>
          ) : (
            <Menu.Item key={item.key} icon={item.icon}>
              <NavLink to={item.path || "#"}>{item.label}</NavLink>
            </Menu.Item>
          )
        )}
      </Menu>
    </div>
  );
};

export default Sidenav;