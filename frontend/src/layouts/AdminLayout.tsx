// MainLayout.tsx
import React from "react";
import { Layout } from "antd";
import Header from "../components/header/Header";
import Sidenav from "../components/sidenav/Sidenav";
import { Outlet } from "react-router-dom";

const { Header: AntHeader, Sider, Content } = Layout;

interface AdminLayoutProps {
}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const HEADER_HEIGHT = 64; // chiều cao header
  const GAP = 8; // khoảng cách giữa Header/Sidenav/Content/Footer

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Header trên cùng */}
      <AntHeader
        style={{
          background: "#fff",
          padding: 0,
          height: HEADER_HEIGHT,
          boxShadow: "0 2px 8px #f0f1f2",
        }}
      >
        <Header/>
      </AntHeader>

      <Layout style={{ padding: GAP }}>
        {/* Sidebar bên trái */}
        <Sider
          width={200}
          style={{
            background: "#fff",
            minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${GAP * 2}px)`,
            marginRight: GAP,
          }}
        >
          <Sidenav color="#fff" />
        </Sider>

        {/* Content bên phải Sidebar */}
        <Layout style={{ background: "#fff", padding: GAP }}>
          <Content
            style={{
              background: "#fff",
              padding: GAP,
              minHeight: `calc(100vh - ${HEADER_HEIGHT}px - ${GAP * 3}px - 64px)`,
              // 64px là dự trữ cho Footer
            }}
          >
            <Outlet /> {/* Route con sẽ hiển thị ở đây */}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;