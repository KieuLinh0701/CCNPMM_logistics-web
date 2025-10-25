import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  totalIncome,
  totalExpense,
  balance,
}) => {
  const cards = [
    {
      title: "Tổng thu",
      value: totalIncome?.toLocaleString() + " VNĐ",
      color: "#1C3D90",
      icon: (
        <ArrowUpOutlined
          style={{
            fontSize: 40,
            color: "#1C3D90",
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Tổng số tiền văn phòng đã thu được (Income)",
    },
    {
      title: "Tổng chi",
      value: totalExpense?.toLocaleString() + " VNĐ",
      color: "#1C3D90",
      icon: (
        <ArrowDownOutlined
          style={{
            fontSize: 40,
            color: "#1C3D90",
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Tổng số tiền văn phòng đã chi ra (Expense)",
    },
    {
      title: "Lợi nhuận",
      value: balance?.toLocaleString() + " VNĐ",
      color: "#1C3D90",
      icon: (
        <DollarCircleOutlined
          style={{
            fontSize: 40,
            color: "#1C3D90",
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Lợi nhuận = Tổng thu - Tổng chi",
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={16} style={{ marginTop: 30 }}>
        {cards.map(({ title, value, color, icon, tooltip }, index) => (
          <Col key={index} xs={24} md={8}>
            <Card
              bordered
              style={{
                position: "relative",
                borderRadius: 12,
                border: "2px solid #1C3D90",
                background: "#fff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                padding: "0px 20px",
                minHeight: 100,
              }}
              hoverable
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "#132B63";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 3px 8px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = "#1C3D90";
              }}
            >
              {icon}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Title level={5} style={{ color, margin: 0 }}>
                    {title}
                  </Title>
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined style={{ color, opacity: 0.7 }} />
                  </Tooltip>
                </div>
                <Text
                  strong
                  style={{
                    color,
                    fontSize: 22,
                    marginTop: 2,
                  }}
                >
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

export default SummaryCard;