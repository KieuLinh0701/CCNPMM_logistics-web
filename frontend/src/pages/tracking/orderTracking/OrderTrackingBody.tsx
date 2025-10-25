import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Timeline, message, Spin, Modal, Row, Col } from "antd";
import { SearchOutlined, TruckOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

interface OrderHistory {
  id: number;
  status: string;
  notes: string;
  createdAt: string;
}

interface OrderData {
  id: number;
  trackingNumber: string;
  status: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  weight: number;
  shippingFee: number;
  cod: number;
  orderValue: number;
  notes: string;
  createdAt: string;
  deliveredAt: string;
  fromOffice: { id: number; name: string };
  toOffice: { id: number; name: string };
  serviceType: { id: number; name: string };
  histories: OrderHistory[];
}

const OrderTrackingBody: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const blueBold = { color: "#1C3D90", fontWeight: "bold" };

  const getStatusText = (status: string) => {
    const map: any = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      picked_up: "Đã lấy hàng",
      in_transit: "Đang vận chuyển",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: any = {
      pending: "orange",
      confirmed: "blue",
      picked_up: "cyan",
      in_transit: "purple",
      delivered: "green",
      cancelled: "red",
    };
    return colorMap[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    if (status === "delivered") return <CheckCircleOutlined />;
    if (status === "in_transit") return <TruckOutlined />;
    return <ClockCircleOutlined />;
  };

  const formatPhone = (phone: string) => {
    if (phone.length <= 3) return phone;
    const last = phone.slice(-3);
    return "X".repeat(phone.length - 3) + last;
  };

  const trackOrder = async (values: { trackingNumber: string }) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/public/orders/track/${values.trackingNumber}`);
      if ((res.data as any).success) {
        setOrderData((res.data as any).data);
        setIsModalVisible(true);
        message.success("Tra cứu đơn hàng thành công!");
      } else {
        message.error((res.data as any).message);
        setOrderData(null);
      }
    } catch {
      message.error("Không tìm thấy đơn hàng với mã này!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", color: "#1C3D90", marginBottom: 24 }}>
        Tra cứu đơn hàng
      </Title>

      <Card style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={trackOrder}>
          <Form.Item
            name="trackingNumber"
            label="Mã vận đơn"
            rules={[{ required: true, message: "Vui lòng nhập mã vận đơn!" }]}
          >
            <Input
              placeholder="Nhập mã vận đơn để tra cứu"
              size="large"
              prefix={<SearchOutlined />}
              style={{ height: 50, fontSize: 16 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              background: "#1C3D90",
              color: "white",
              width: "100%",
              height: 50,
              fontSize: 16,
            }}
          >
            Tra cứu
          </Button>
        </Form>
      </Card>

      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tra cứu đơn hàng...</div>
        </div>
      )}

      <Modal
        title={<Title level={3} style={{ color: "#1C3D90", marginBottom: 0 }}>Thông tin đơn hàng</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={850}
        style={{ top: 20 }}
        bodyStyle={{ background: "#fff", borderRadius: 10, padding: "24px" }}
      >
        {orderData && (
          <div>
            {/* Mã vận đơn */}
            <div style={{ marginBottom: 24, border: "1px solid #e0e0e0", padding: "16px 20px", borderRadius: 12 }}>
              <Title level={4} style={{ color: "#1C3D90", marginBottom: 8 }}>
                Mã vận đơn: {orderData.trackingNumber}
              </Title>
              <Text strong style={{ color: getStatusColor(orderData.status), fontSize: 16 }}>
                Trạng thái: {getStatusText(orderData.status)}
              </Text>
            </div>

            {/* Người gửi & Người nhận */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card
                  title="Thông tin người gửi"
                  bordered
                  style={{ borderRadius: 12 }}
                  headStyle={{ color: "#1C3D90", fontWeight: "bold" }}
                >
                  <p><strong>Tên:</strong> {orderData.senderName}</p>
                  <p><strong>SĐT:</strong> {formatPhone(orderData.senderPhone)}</p>
                  <p><strong>Bưu cục gửi:</strong> {orderData.fromOffice.name}</p>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  title="Thông tin người nhận"
                  bordered
                  style={{ borderRadius: 12 }}
                  headStyle={{ color: "#1C3D90", fontWeight: "bold" }}
                >
                  <p><strong>Tên:</strong> {orderData.recipientName}</p>
                  <p><strong>SĐT:</strong> {formatPhone(orderData.recipientPhone)}</p>
                  <p><strong>Bưu cục nhận:</strong> {orderData.toOffice.name}</p>
                </Card>
              </Col>
            </Row>

            {/* Gộp hàng hóa + chi phí */}
            <Card
              title="Thông tin hàng hóa"
              bordered
              style={{ borderRadius: 12, marginBottom: 24 }}
              headStyle={{ color: "#1C3D90", fontWeight: "bold" }}
            >
              <Row gutter={[16, 15]}>
                <Col span={8}><strong>Khối lượng:</strong> <span style={blueBold}>{orderData.weight} kg</span></Col>
                <Col span={8}><strong>Giá trị hàng:</strong> <span style={blueBold}>{orderData.orderValue.toLocaleString()} VNĐ</span></Col>
                <Col span={8}><strong>Thu hộ (COD):</strong> <span style={blueBold}>{orderData.cod.toLocaleString()} VNĐ</span></Col>
                <Col span={8}><strong>Dịch vụ:</strong> <span style={blueBold}>{orderData.serviceType.name}</span></Col>
                <Col span={8}><strong>Phí vận chuyển:</strong> <span style={blueBold}>{orderData.shippingFee.toLocaleString()} VNĐ</span></Col>
                <Col span={8}><strong>Ghi chú:</strong> <span style={blueBold}>{orderData.notes || "Không có"}</span></Col>
              </Row>

            </Card>

            {/* Trạng thái đơn hàng */}
            <Card
              title="Trạng thái đơn hàng"
              bordered
              style={{ borderRadius: 12 }}
              headStyle={{ color: "#1C3D90", fontWeight: "bold" }}
            >
              <Timeline>
                {orderData.histories.map((h) => (
                  <Timeline.Item
                    key={h.id}
                    color={getStatusColor(h.status)}
                    dot={getStatusIcon(h.status)}
                  >
                    <Text strong>{getStatusText(h.status)}</Text>
                    <div style={{ color: "#666", fontSize: 12 }}>
                      {new Date(h.createdAt).toLocaleString("vi-VN")}
                    </div>
                    {h.notes && <div style={{ marginTop: 4 }}>{h.notes}</div>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderTrackingBody;
