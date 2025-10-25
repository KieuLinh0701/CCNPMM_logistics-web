import React from "react";
import { Layout, Typography, Button, Card } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { BellOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const NotificationDetail: React.FC = () => {
    const { state } = useLocation() as any;
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = state?.notification;
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const formatTime = (createdAt: string) => {
        const now = new Date();
        const notificationTime = new Date(createdAt);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    const getNotificationLink = (type?: string) => {
        switch (type) {
            case "new_order":
                return `/${user.role}/orders`;
            case "delivery_assigned":
                return `/${user.role}/deliveries`;
            case "cod_reminder":
                return `/${user.role}/payments`;
            case "ShippingRequest":
                return `/${user.role}/orders/requests`;
            case "order":
                return `/${user.role}/orders`;
            default:
                return null;
        }
    };

    if (!notification) {
        return (
            <Layout style={{ background: "#fff", padding: 24, minHeight: "100vh" }}>
                <Content style={{ textAlign: "center", marginTop: 100 }}>
                    <BellOutlined style={{ fontSize: 36, color: "#aaa" }} />
                    <p>Không tìm thấy thông báo (ID: {id})</p>
                    <Button type="primary" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ background: "#fff", paddingLeft: 24, minHeight: "100vh" }}>
            <Content>
                <Title level={3} style={{ color: "#1C3D90", marginBottom: 24 }}>
                    Thông báo
                </Title>

                <Card
                    style={{
                        borderRadius: 10,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        padding: 20,
                        width: "100%",
                        marginBottom: 20,
                    }}
                >
                    <Title level={4} style={{ color: "#1C3D90", margin: 0 }}>
                        {notification.title}
                    </Title>
                    <Text type="secondary" style={{ fontStyle: "italic", fontSize: 13 }}>
                        {formatTime(notification.createdAt)}
                    </Text>

                    <div style={{ marginTop: 20, fontSize: 15, lineHeight: 1.6 }}>
                        {notification.message}
                    </div>

                    {/* Link điều hướng */}
                    {getNotificationLink(notification?.type) && (
                        <div style={{ textAlign: "left", marginTop: 12 }}>
                            <a
                                onClick={() => {
                                    navigate(getNotificationLink(notification?.type)!);
                                }}
                                style={{
                                    color: "#1C3D90",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    textDecoration: "none",
                                    fontSize: 15,
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.textDecoration = "underline")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.textDecoration = "none")
                                }
                            >
                                Xem chi tiết →
                            </a>
                        </div>
                    )}

                    <Button onClick={() => navigate(-1)} style={{ marginTop: 32, backgroundColor: '#1C3D90', color: 'white' }}>
                        Quay lại
                    </Button>
                </Card>
            </Content>
        </Layout>
    );
};

export default NotificationDetail;