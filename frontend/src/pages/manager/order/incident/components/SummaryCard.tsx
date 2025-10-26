import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Summary } from "../../../../../types/incidentReport";

const { Title, Text } = Typography;

interface Props {
  totalByStatus: Summary[]; 
}

const SummaryCard: React.FC<Props> = ({ totalByStatus }) => {
  const mainColor = "#1C3D90";

  const statusMap: Record<string, any> = {
    pending: {
      title: "Đang chờ xử lý",
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
      tooltip: "Các báo cáo đang chờ xử lý",
    },
    processing: {
      title: "Đang giải quyết",
      icon: (
        <EditOutlined
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
      tooltip: "Các báo cáo đang được giải quyết",
    },
    resolved: {
      title: "Đã giải quyết",
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
      tooltip: "Các báo cáo đã được giải quyết thành công",
    },
    rejected: {
      title: "Bị từ chối",
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
      tooltip: "Các báo cáo bị từ chối",
    },
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <Row gutter={16}>
        {totalByStatus.map(({ key: status, value: count }) => {
          const item = statusMap[status];
          if (!item) return null; 
          return (
            <Col key={status} xs={24} md={12} lg={6}>
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
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = "#132B63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 8px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = mainColor;
                }}
              >
                {item.icon}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Title level={5} style={{ color: mainColor, margin: 0 }}>
                      {item.title}
                    </Title>
                    <Tooltip title={item.tooltip}>
                      <InfoCircleOutlined style={{ color: mainColor, opacity: 0.7 }} />
                    </Tooltip>
                  </div>
                  <Text strong style={{ color: mainColor, fontSize: 22 }}>
                    {count}
                  </Text>
                  <Text style={{ color: "rgba(0,0,0,0.65)" }}>
                    Số lượt: <b>{count}</b>
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

export default SummaryCard;