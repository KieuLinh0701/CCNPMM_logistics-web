import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Summary } from "../../../../../types/shippingRequest";

const { Title, Text } = Typography;

interface Props {
  data: Summary[];
}

const RequestStatusSummaryCard: React.FC<Props> = ({ data }) => {
  const mainColor = "#1C3D90";

  // Map status với icon, title và tooltip
  const statusMap: Record<string, any> = {
    Pending: {
      title: "Pending",
      icon: (
        <ClockCircleOutlined
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
      tooltip: "Yêu cầu đang chờ xử lý",
    },
    Processing: {
      title: "Processing",
      icon: (
        <SyncOutlined
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
      tooltip: "Yêu cầu đang được xử lý",
    },
    Resolved: {
      title: "Resolved",
      icon: (
        <CheckCircleOutlined
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
      tooltip: "Yêu cầu đã được giải quyết",
    },
    Rejected: {
      title: "Rejected",
      icon: (
        <CloseCircleOutlined
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
      tooltip: "Yêu cầu bị từ chối",
    },
    Cancelled: {
      title: "Cancelled",
      icon: (
        <CloseCircleOutlined
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
      tooltip: "Yêu cầu đã bị hủy",
    },
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <Row
        gutter={16}
        style={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-between" }}
      >
        {data.map(({ label, value }) => {
          const item = statusMap[label] || { title: label, icon: null, tooltip: "" };
          return (
            <div
              key={label}
              style={{ flex: 1, minWidth: 160, marginRight: 16 }}
            >
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
                  e.currentTarget.style.borderColor = mainColor;
                }}
              >
                {item.icon}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Title level={5} style={{ color: mainColor, margin: 0 }}>
                      {item.title}
                    </Title>
                    {item.tooltip && (
                      <Tooltip title={item.tooltip}>
                        <InfoCircleOutlined style={{ color: mainColor, opacity: 0.7 }} />
                      </Tooltip>
                    )}
                  </div>
                  <Text strong style={{ color: mainColor, fontSize: 22 }}>
                    {value}
                  </Text>
                </div>
              </Card>
            </div>
          );
        })}
      </Row>
    </div>
  );
};

export default RequestStatusSummaryCard;