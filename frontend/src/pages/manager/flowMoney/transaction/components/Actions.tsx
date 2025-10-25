import React from "react";
import { Button, Col, Row, Space, Typography } from "antd";
import { FileExcelOutlined, HistoryOutlined, PlusCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Props {
  onExport: () => void;
  onAdd: () => void;
}

const Actions: React.FC<Props> = ({ onExport, onAdd }) => {
  return (
    <Row justify="space-between" align="middle" style={{ width: '100%', marginBottom: 25, marginTop: 30 }}>
      <Col>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
            Lịch sử giao dịch
          </Title>
        </div>
      </Col>

      <Col>
        <Space>
          <Button
            style={{
              backgroundColor: '#1C3D90',
              color: 'white',
              border: 'none',
            }}
            onClick={onAdd}
            icon={<PlusCircleOutlined />}
          >
            Tạo giao dịch
          </Button>
          <Button
            style={{
              backgroundColor: '#1C3D90',
              color: 'white',
              border: 'none',
            }}
            icon={<FileExcelOutlined />}
            onClick={onExport}
          >
            Xuất Excel
          </Button>
        </Space>
      </Col>
    </Row>
  );
};

export default Actions;