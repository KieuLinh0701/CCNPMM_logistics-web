import React, { useState } from "react";
import { Card, Typography, Row, Col, Tooltip, Collapse, Tag } from "antd";
import { InfoCircleOutlined, TeamOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Summary } from "../../../../types/employee";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface EmployeeSummaryCardProps {
  statusSummary: Summary[];
  shiftSummary: Summary[];
}

const EmployeeSummaryCard: React.FC<EmployeeSummaryCardProps> = ({
  statusSummary,
  shiftSummary,
}) => {
  const [activeKey, setActiveKey] = useState<string[]>([]);

  const renderCard = (title: string, color: string, icon: React.ReactNode, data: Summary[], tooltip: string) => (
    <Card
      bordered
      style={{
        position: "relative",
        borderRadius: 12,
        border: `2px solid ${color}`,
        background: "#fff",
        boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        padding: "0px 20px",
        minHeight: 100,
      }}
      hoverable
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
        e.currentTarget.style.borderColor = "#132B63";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.05)";
        e.currentTarget.style.borderColor = color;
      }}
    >
      {icon}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Title level={5} style={{ color, margin: 0 }}>
            {title}
          </Title>
          <Tooltip title={tooltip}>
            <InfoCircleOutlined style={{ color, opacity: 0.7 }} />
          </Tooltip>
        </div>

        <div style={{ marginTop: 4 }}>
          {data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: index < data.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <Text>{item.label}</Text>
                <Tag color={color} style={{ fontWeight: 600 }}>
                  {item.value}
                </Tag>
              </div>
            ))
          ) : (
            <Text type="secondary">Không có dữ liệu</Text>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ marginBottom: 30 }}>
      <Collapse
        activeKey={activeKey}
        onChange={(keys) => setActiveKey(keys as string[])}
        bordered={false}
        expandIconPosition="end"
        style={{
          background: "transparent",
        }}
      >
        <Panel
          header={<Title level={5} style={{ margin: 0, color: '#1C3D90' }}> Thống kê nhân viên</Title>}
          key="1"
          style={{
            background: "#f9fafc",
            borderRadius: 12,
            border: "1px solid #e0e0e0",
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              {renderCard(
                "Trạng thái nhân viên",
                "#1C3D90",
                <TeamOutlined
                  style={{
                    fontSize: 40,
                    color: "#1C3D90",
                    opacity: 0.15,
                    position: "absolute",
                    top: 14,
                    right: 14,
                  }}
                />,
                statusSummary,
                "Thống kê trạng thái làm việc của nhân viên"
              )}
            </Col>
            <Col xs={24} md={12}>
              {renderCard(
                "Ca làm việc",
                "#1C3D90",
                <ClockCircleOutlined
                  style={{
                    fontSize: 40,
                    color: "#1C3D90",
                    opacity: 0.15,
                    position: "absolute",
                    top: 14,
                    right: 14,
                  }}
                />,
                shiftSummary,
                "Thống kê số lượng nhân viên theo ca"
              )}
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
};

export default EmployeeSummaryCard;