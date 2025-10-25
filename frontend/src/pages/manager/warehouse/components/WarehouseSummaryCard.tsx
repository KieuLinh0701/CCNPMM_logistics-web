import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import { InboxOutlined, HomeOutlined, ExportOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface WarehouseSummaryCardProps {
  incomingCount: number;
  inWarehouseCount: number;
  exportedCount: number;
}

const WarehouseSummaryCard: React.FC<WarehouseSummaryCardProps> = ({
  incomingCount,
  inWarehouseCount,
  exportedCount,
}) => {
  const mainColor = "#1C3D90"; // màu chủ đạo

  const cards = [
    {
      title: "Chuẩn bị nhập",
      value: incomingCount,
      icon: (
        <InboxOutlined
          style={{
            fontSize: 40,
            color: mainColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Số đơn hàng đang chuẩn bị nhập kho, bao gồm đã lấy từ khách hoặc đang vận chuyển về kho.",
    },
    {
      title: "Đang trong kho",
      value: inWarehouseCount,
      icon: (
        <HomeOutlined
          style={{
            fontSize: 40,
            color: mainColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Số đơn hàng đang có trong kho",
    },
    {
      title: "Đã xuất kho",
      value: exportedCount,
      icon: (
        <ExportOutlined
          style={{
            fontSize: 40,
            color: mainColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Số đơn hàng đã xuất khỏi kho",
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={16} style={{ marginTop: 16 }}>
        {cards.map(({ title, value, icon, tooltip }, index) => (
          <Col key={index} xs={24} md={8}>
            <Card
              bordered
              style={{
                position: "relative",
                borderRadius: 12,
                border: `2px solid ${mainColor}`,
                background: "#fff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                padding: "0px 20px",
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = mainColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = mainColor;
              }}
            >
              {icon}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Title level={5} style={{ color: mainColor, margin: 0 }}>
                    {title}
                  </Title>
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined style={{ color: mainColor, opacity: 0.7 }} />
                  </Tooltip>
                </div>
                <Text strong style={{ color: mainColor, fontSize: 22, marginTop: 2 }}>
                  {value}
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default WarehouseSummaryCard;