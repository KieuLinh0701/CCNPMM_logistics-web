import React from "react";
import { Button, Col, Row, Typography, Breadcrumb } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface Props {
  onExport: () => void;
}

const Actions: React.FC<Props> = ({ onExport }) => {
  return (
    <>
      <Row justify="space-between" align="middle" style={{ width: '100%', marginBottom: 5, marginTop: 30 }}>
        <Col>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
              Danh sách chuyến đi
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

      <Breadcrumb separator="/" style={{ marginBottom: 10 }}>
        <Breadcrumb.Item>Quản lý nhân sự</Breadcrumb.Item>
        <Breadcrumb.Item>
        <a href={`/manager/employees/performance`}>Hiệu suất nhân viên</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Danh sách chuyến đi</Breadcrumb.Item>
      </Breadcrumb>
    </>
  );
};

export default Actions;