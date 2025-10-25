import React from "react";
import { Row, Button, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";

interface Props {
  onAdd: () => void;
}

const Actions: React.FC<Props> = ({ onAdd }) => {
  return (
    <Row justify="space-between" align="middle" style={{ width: '100%' }}>
      {/* Title bên trái */}
      <Col>
        <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
          Danh sách đơn hàng
        </Title>
      </Col>

      {/* Nút bên phải */}
      <Col>
        <Button
          style={{
            backgroundColor: '#1C3D90',
            color: 'white',
            border: 'none',
          }}
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          Tạo đơn hàng
        </Button>
      </Col>
    </Row>
  );
};

export default Actions;