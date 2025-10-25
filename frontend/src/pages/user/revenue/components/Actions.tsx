import React from "react";
import { Button, Col, Row, Typography } from "antd";
import { FileExcelOutlined, HistoryOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Props {
  onExport: () => void;
}

const Actions: React.FC<Props> = ({ onExport }) => {
  return (
    <Row justify="space-between" align="middle" style={{ width: '100%', marginBottom: 25, marginTop: 40 }}>
      <Col>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
            Lịch sử giao dịch
          </Title>
        </div>
      </Col>

      <Col>
        <Button
          style={{
            backgroundColor: '#1C3D90',
            color: 'white',
            border: 'none',
          }}
          onClick={onExport}
          icon={<FileExcelOutlined />}
        >
          Xuất Excel
        </Button>
      </Col>
    </Row>
  );
};

export default Actions;