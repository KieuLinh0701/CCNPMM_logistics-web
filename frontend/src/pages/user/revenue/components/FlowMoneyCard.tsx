import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  WalletOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface FlowItem {
  label: string;
  value: string;
  tooltip: string;
}

interface FlowMoneyCardProps {
  data1: FlowItem[];
  data2: FlowItem[];
}

const FlowMoneyCard: React.FC<FlowMoneyCardProps> = ({ data1, data2 }) => {
  const cards = [
    {
      data: data1,
      title: "Bạn dự kiến nhận được",
      color: "#1C3D90",
      icon: <DollarOutlined style={{ fontSize: 20, color: "#1C3D90" }} />,
    },
    {
      data: data2,
      title: "Tiền COD đã ký nhận",
      color: "#1C3D90",
      icon: <WalletOutlined style={{ fontSize: 20, color: "#1C3D90" }} />,
    },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <Row gutter={16}>
        {cards.map(({ data, title, color, icon }, index) => (
          <Col key={index} xs={24} md={12}>
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
                minHeight: 120,
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
              {/* Icon + Title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {icon}
                <Title level={5} style={{ color, margin: 0 }}>
                  {title}
                </Title>
              </div>

              {/* Dòng dữ liệu */}
              {data.map((item, idx) => (
                <Row
                  key={idx}
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 6 }}
                >
                  <Col>
                    <Text style={{ color: "#333", fontSize: 14 }}>
                      {item.label}
                      <Tooltip title={item.tooltip}>
                        <InfoCircleOutlined
                          style={{ color, opacity: 0.7, marginLeft: 4 }}
                        />
                      </Tooltip>
                    </Text>
                  </Col>
                  <Col>
                    <Text strong style={{ color, fontSize: 14 }}>
                      {item.value}
                    </Text>
                  </Col>
                </Row>
              ))}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FlowMoneyCard;