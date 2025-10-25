import React from "react";
import { Breadcrumb, Button, Col, Row, Space, Typography } from "antd";
import { FileExcelOutlined, HistoryOutlined, PlusCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Props {
  onExport: () => void;
}

const Actions: React.FC<Props> = ({ onExport }) => {
  return (
    <div>
      <Row justify="space-between" align="middle" style={{ width: '100%', marginBottom: 5, marginTop: 30 }}>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
              Hiệu suất nhân viên
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
            icon={<FileExcelOutlined />}
            onClick={onExport}
          >
            Xuất Excel
          </Button>
        </Col>
      </Row>

      <Row>
        <Breadcrumb separator="/" style={{ marginBottom: 10 }}>
          <Breadcrumb.Item>Quản lý nhân sự</Breadcrumb.Item>
          <Breadcrumb.Item>Hiệu suất nhân viên</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
    </div>
  );
};

export default Actions;