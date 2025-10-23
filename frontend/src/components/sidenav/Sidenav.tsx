import React, { useState, useEffect } from "react";
import { Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  GlobalOutlined,
  ShoppingOutlined,
  CarOutlined,
  DatabaseOutlined,
  HomeOutlined,
  TeamOutlined,
  DollarOutlined,
  DropboxOutlined,
  SearchOutlined,
  UserOutlined,
  ShopOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  BarChartOutlined,
  ProfileOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
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

  // ✅ Lấy role từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role || "user";

  // ✅ Config menu theo role
  const menuConfig: Record<string, MenuItem[]> = {
    admin: [
      {
        key: "/admin/dashboard",
        label: "Báo cáo & Thống kê",
        path: "/admin/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "/admin/users",
        label: "Quản lý người dùng",
        path: "/admin/users",
        icon: <UserOutlined />,
      },
      {
        key: "/admin/postoffices",
        label: "Quản lý bưu cục",
        path: "/admin/postoffices",
        icon: <ShopOutlined />,
      },
      {
        key: "/admin/servicetypes",
        label: "Loại dịch vụ",
        path: "/admin/servicetypes",
        icon: <SettingOutlined />,
      },
      {
        key: "/admin/orders",
        label: "Đơn hàng",
        path: "/admin/orders",
        icon: <ShoppingCartOutlined />,
      },
      {
        key: "/admin/vehicles",
        label: "Phương tiện",
        path: "/admin/vehicles",
        icon: <CarOutlined />,
      },
      {
        key: "/admin/promotions",
        label: "Khuyến mãi",
        path: "/admin/promotions",
        icon: <GiftOutlined />,
      },
      {
        key: "/admin/reports",
        label: "Báo cáo",
        path: "/admin/reports",
        icon: <BarChartOutlined />,
      },
      {
        key: "/admin/financial",
        label: "Quản lý dòng tiền",
        path: "/admin/financial",
        icon: <DollarOutlined />,
      },
      {
        key: "/admin/profile",
        label: "Hồ sơ",
        path: "/admin/profile",
        icon: <ProfileOutlined />,
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
            key: "/manager/orders",
            label: "Danh sách đơn hàng",
            path: "/manager/orders",
          },
          {
            key: "/manager/orders/assign",
            label: "Phân công đơn hàng",
            path: "/manager/orders/assign",
          },
        ],
      },
      {
        key: "/manager/supports",
        label: "Hỗ trợ & Khiếu nại",
        path: "/manager/supports",
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
        key: "/manager/vehicles",
        label: "Quản lý phương tiện",
        path: "/manager/vehicles",
        icon: <CarOutlined />,
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
            key: "/user/orders",
            label: "Danh sách đơn hàng",
            path: "/user/orders",
          },
          {
            key: "/user/orders/request",
            label: "Hỗ trợ & Khiếu nại",
            path: "/user/orders/requests",
          },
        ],
      },
      {
        key: "/user/products",
        label: "Quản lý sản phẩm",
        path: "/user/products",
        icon: <DropboxOutlined />,
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
      {
        key: "tracking",
        label: "Tra cứu thông tin",
        icon: <SearchOutlined />,
        children: [
          {
            key: "/user/tracking/shipping-fee",
            label: "Tra cứu cước vận chuyển",
            path: "/user/tracking/shipping-fee",
          },
          {
            key: "/user/tracking/office-search",
            label: "Tra cứu bưu cục",
            path: "/user/tracking/office-search",
          },
          {
            key: "/user/info/shipping-rates",
            label: "Bảng giá",
            path: "/user/info/shipping-rates",
          },
        ],
      },
    ],
    shipper: [ 
      {
        key: "/shipper/dashboard",
        label: "Tổng quan",
        path: "/shipper/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "shipper-orders",
        label: "Quản lý đơn hàng",
        icon: <ShoppingOutlined />,
        children: [
          {
            key: "/shipper/orders-unassigned",
            label: "Danh sách đơn hàng",
            path: "/shipper/orders-unassigned",
          },
          {
            key: "/shipper/orders",
            label: "Đơn hàng cần giao",
            path: "/shipper/orders",
          },
        ],
      },
      {
        key: "/shipper/route",
        label: "Lộ trình giao hàng",
        path: "/shipper/route",
        icon: <CarOutlined />,
      },
      {
        key: "/shipper/pickup",
        label: "Nhận/Trả hàng",
        path: "/shipper/pickup",
        icon: <InboxOutlined />,
      },
      {
        key: "/shipper/cod",
        label: "Quản lý COD",
        path: "/shipper/cod",
        icon: <DollarOutlined />,
      },
      {
        key: "/shipper/history",
        label: "Lịch sử giao hàng",
        path: "/shipper/history",
        icon: <ClockCircleOutlined />,
      },
      {
        key: "/shipper/report",
        label: "Báo cáo sự cố",
        path: "/shipper/report",
        icon: <ExclamationCircleOutlined />,
      },
      {
        key: "/shipper/profile",
        label: "Hồ sơ cá nhân",
        path: "/shipper/profile",
        icon: <ProfileOutlined />,
      },
    ],
    driver: [
      {
        key: "/driver/dashboard",
        label: "Tổng quan",
        path: "/driver/dashboard",
        icon: <DashboardOutlined />,
      },
      {
        key: "/driver/orders",
        label: "Đơn hàng cần nhận",
        path: "/driver/orders",
        icon: <ShoppingOutlined />,
      },
      {
        key: "/driver/shipments",
        label: "Quản lý chuyến vận chuyển",
        path: "/driver/shipments",
        icon: <TruckOutlined />,
      },
      {
        key: "/driver/route",
        label: "Lộ trình vận chuyển",
        path: "/driver/route",
        icon: <EnvironmentOutlined />,
      },
      {
        key: "/driver/history",
        label: "Lịch sử vận chuyển",
        path: "/driver/history",
        icon: <ClockCircleOutlined />,
      },
      {
        key: "/driver/profile",
        label: "Hồ sơ cá nhân",
        path: "/driver/profile",
        icon: <ProfileOutlined />,
      },
    ],
  };

  const menuItems = menuConfig[role] || menuConfig.user;

  // ✅ mở submenu theo path hiện tại
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
        selectedKeys={[pathname]}
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
              <NavLink to={item.path || "#"}>{item.label}</NavLink> {/* ← SỬA LỖI: item.label thay vì child.label */}
            </Menu.Item>
          )
        )}
      </Menu>
    </div>
  );
};

export default Sidenav;