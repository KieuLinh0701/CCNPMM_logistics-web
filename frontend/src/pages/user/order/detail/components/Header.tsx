import React from "react";
import { Breadcrumb } from "antd";
import Title from "antd/es/typography/Title";
import { styles } from "../../style/Order.styles";

interface Props {
  trackingNumber: string;
  role: string;
}

const Header: React.FC<Props> = ({ trackingNumber, role }) => (
  <div>
    <Title level={3} style={{ color: "#1C3D90", paddingLeft: 32, paddingRight: 32 }}>
      Chi tiết đơn hàng #{trackingNumber}
    </Title>
    <Breadcrumb separator="/" style={{ marginBottom: 10, paddingLeft: 32, paddingRight: 32 }}>
      <Breadcrumb.Item>
         <a href={`/${role}/orders`}>Danh sách đơn hàng</a>
      </Breadcrumb.Item>
      <Breadcrumb.Item>Chi tiết đơn hàng</Breadcrumb.Item>
    </Breadcrumb>
  </div>
);

export default Header;