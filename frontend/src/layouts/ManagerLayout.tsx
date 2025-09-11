// MainLayout.tsx
import React, { useState } from "react";
import { Layout, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Header from "../components/header/Header";
import Sidenav from "../components/sidenav/Sidenav";
import { Outlet } from "react-router-dom";

const { Header: AntHeader, Sider, Content } = Layout;

const ManagerLayout: React.FC = () => {
  const HEADER_HEIGHT = 64;
  const GAP = 8;

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <AntHeader
        style={{
          background: "#fff",
          height: HEADER_HEIGHT,
          boxShadow: "0 2px 8px #f0f1f2",
          padding: 0,
        }}
      >
        <Header />
      </AntHeader>

      <Layout style={{ padding: GAP }}>
        <Sider
          width={220}
          collapsible
          collapsed={collapsed}
          collapsedWidth={60}
          trigger={null}
          breakpoint="lg"  
          onBreakpoint={(broken) => setCollapsed(broken)}
          style={{
            background: "#fff",
            marginRight: GAP,
            borderRadius: 6,
            position: "relative", 
          }}
        >
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <Sidenav color="#fff" />
            </div>
            <div
              style={{
                padding: "8px",
                borderTop: "1px solid #f0f0f0",
                textAlign: "center",
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "18px",
                  width: "100%",
                  height: 40,
                  borderRadius: "8px", 
                }}
              />
            </div>
          </div>
        </Sider>

        <Layout
          style={{
            background: "#fff",
            padding: GAP,
            borderRadius: 6,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Content
            style={{
              background: "#fff",
              padding: GAP,
              borderRadius: 6,
              flex: 1,
              overflowY: "auto",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;