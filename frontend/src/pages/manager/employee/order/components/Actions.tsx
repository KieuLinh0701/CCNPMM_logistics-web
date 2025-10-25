import React from "react";
import { Breadcrumb, Row, Typography } from "antd";

const { Title } = Typography;

interface Props {
  employeeId: number;
}

const Actions: React.FC<Props> = ({ employeeId }) => {
  return (
    <>
      <Row justify="space-between" align="middle" style={{ width: '100%', marginBottom: 5, marginTop: 30 }}>
        <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
          Danh sách đơn hàng
        </Title>
      </Row>

      <Row justify="start" style={{ marginBottom: 10 }}>
        <Breadcrumb separator="/">
          <Breadcrumb.Item>Quản lý nhân sự</Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href={`/manager/employees/performance`}>Hiệu suất nhân viên</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a href={`/manager/employees/performance/${employeeId}/shipments`}>Danh sách chuyến đi</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách đơn hàng</Breadcrumb.Item>
        </Breadcrumb>
      </Row>
    </>
  );
};

export default Actions;