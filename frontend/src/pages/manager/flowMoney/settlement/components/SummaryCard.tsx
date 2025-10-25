import React from "react";
import { Card, Typography, Row, Col, Tooltip } from "antd";
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { SubmissionSummary } from "../../../../../types/paymentSubmission";

const { Title, Text } = Typography;

interface Props {
  data: SubmissionSummary[];
}

const SubmissionSummaryCard: React.FC<Props> = ({ data }) => {
  const mainColor = "#1C3D90";

  const statusMap: Record<string, any> = {
    Pending: {
      title: "Đang chờ duyệt",
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
      tooltip: "Các đối soát đang chờ xác nhận từ quản lý",
    },
    Confirmed: {
      title: "Đã xác nhận",
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
      tooltip: "Các đối soát đã được duyệt thành công",
    },
    Adjusted: {
      title: "Đã điều chỉnh",
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
      tooltip: "Các đối soát đã được điều chỉnh lại số tiền",
    },
    Rejected: {
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
      tooltip: "Các đối soát bị từ chối bởi quản lý",
    },
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <Row gutter={16}>
        {data.map(({ status, count, totalAmount }) => {
          const item = statusMap[status];
          const value =
            Number(totalAmount || 0).toLocaleString("vi-VN") + " VNĐ";
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
                      <InfoCircleOutlined
                        style={{ color: mainColor, opacity: 0.7 }}
                      />
                    </Tooltip>
                  </div>
                  <Text strong style={{ color: mainColor, fontSize: 22 }}>
                    {value}
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

export default SubmissionSummaryCard;