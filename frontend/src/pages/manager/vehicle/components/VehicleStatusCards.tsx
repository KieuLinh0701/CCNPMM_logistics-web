import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  CarOutlined,
  ToolOutlined,
  StopOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { VehicleStatusCount } from "../../../../types/vehicle";

const { Title, Text } = Typography;

interface VehicleStatusCardsProps {
  statusCounts: VehicleStatusCount[];
}

const VehicleStatusCards: React.FC<VehicleStatusCardsProps> = ({ statusCounts }) => {
  const primaryColor = "#1C3D90";

  const statusMap: Record<
    string,
    { label: string; icon: React.ReactNode; tooltip: string }
  > = {
    Available: {
      label: "Xe sẵn sàng",
      icon: (
        <CheckCircleOutlined
          style={{
            fontSize: 40,
            color: primaryColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Xe đang sẵn sàng để sử dụng",
    },
    InUse: {
      label: "Đang sử dụng",
      icon: (
        <CarOutlined
          style={{
            fontSize: 40,
            color: primaryColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Xe hiện đang được sử dụng cho nhiệm vụ",
    },
    Maintenance: {
      label: "Đang bảo trì",
      icon: (
        <ToolOutlined
          style={{
            fontSize: 40,
            color: primaryColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Xe đang trong quá trình bảo dưỡng, sửa chữa",
    },
    Archived: {
      label: "Ngưng hoạt động",
      icon: (
        <StopOutlined
          style={{
            fontSize: 40,
            color: primaryColor,
            opacity: 0.15,
            position: "absolute",
            top: 35,
            right: 14,
          }}
        />
      ),
      tooltip: "Xe đã ngưng hoạt động hoặc bị xóa khỏi hệ thống",
    },
  };

  return (
    <div style={{ marginBottom: 30 }}>
      <Row gutter={16}>
        {statusCounts.map(({ status, total }) => {
          const cfg = statusMap[status] || {
            label: status,
            icon: (
              <InfoCircleOutlined
                style={{
                  fontSize: 40,
                  color: primaryColor,
                  opacity: 0.15,
                  position: "absolute",
                  top: 35,
                  right: 14,
                }}
              />
            ),
            tooltip: "Trạng thái khác",
          };

          return (
            <Col key={status} xs={24} md={6}>
              <Card
                bordered
                style={{
                  position: "relative",
                  borderRadius: 12,
                  border: `2px solid ${primaryColor}`,
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
                  e.currentTarget.style.borderColor = primaryColor;
                }}
              >
                {cfg.icon}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Title level={5} style={{ color: primaryColor, margin: 0 }}>
                      {cfg.label}
                    </Title>
                    <Tooltip title={cfg.tooltip}>
                      <InfoCircleOutlined
                        style={{ color: primaryColor, opacity: 0.7 }}
                      />
                    </Tooltip>
                  </div>
                  <Text
                    strong
                    style={{
                      color: primaryColor,
                      fontSize: 22,
                      marginTop: 2,
                    }}
                  >
                    {total}
                  </Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default VehicleStatusCards;