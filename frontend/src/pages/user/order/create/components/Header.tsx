import React from "react";
import { Breadcrumb } from "antd";
import Title from "antd/es/typography/Title";
import { styles } from "../../style/Order.styles";

interface Props {
  role: string;
}

const Header: React.FC<Props> = ({ role }) => (
  <div>
    <Title level={3} style={styles.title}>
      Tạo đơn hàng mới
    </Title>
    <Breadcrumb separator="/" style={{ marginBottom: 30 }}>
      <Breadcrumb.Item>
        <a href={`/${role}/orders`}>Danh sách đơn hàng</a>
      </Breadcrumb.Item>
      <Breadcrumb.Item>Tạo đơn hàng</Breadcrumb.Item>
    </Breadcrumb>
  </div>
);

export default Header;