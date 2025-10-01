import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Timeline, message, Spin } from "antd";
import { SearchOutlined, TruckOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
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
  fromOffice: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
  };
  toOffice: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
  };
  serviceType: {
    id: number;
    name: string;
    deliveryTime: string;
  };
  histories: OrderHistory[];
}

const OrderTracking: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      picked_up: "Đã lấy hàng",
      in_transit: "Đang vận chuyển",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: "orange",
      confirmed: "blue",
      picked_up: "cyan",
      in_transit: "purple",
      delivered: "green",
      cancelled: "red"
    };
    return colorMap[status] || "default";
  };

  const getStatusIcon = (status: string) => {
    if (status === "delivered") return <CheckCircleOutlined />;
    if (status === "in_transit") return <TruckOutlined />;
    return <ClockCircleOutlined />;
  };

  const trackOrder = async (values: { trackingNumber: string }) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/public/orders/track/${values.trackingNumber}`);
      if ((response.data as any).success) {
        setOrderData((response.data as any).data);
        message.success("Tra cứu đơn hàng thành công!");
      } else {
        message.error((response.data as any).message);
        setOrderData(null);
      }
    } catch (error: any) {
      message.error("Không tìm thấy đơn hàng với mã vận đơn này");
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ 
                  background: "#1C3D90", 
                  color: "white", 
                  width: "100%", 
                  height: 50, 
                  fontSize: 16 
                }}
              >
                Tra cứu
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Đang tra cứu đơn hàng...</div>
          </div>
        )}

        {orderData && (
          <Card title="Thông tin đơn hàng">
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>Mã vận đơn: {orderData.trackingNumber}</Title>
              <Text strong style={{ color: getStatusColor(orderData.status) }}>
                Trạng thái: {getStatusText(orderData.status)}
              </Text>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              <div>
                <Title level={5}>Thông tin người gửi</Title>
                <p><strong>Tên:</strong> {orderData.senderName}</p>
                <p><strong>SĐT:</strong> {orderData.senderPhone}</p>
                <p><strong>Bưu cục gửi:</strong> {orderData.fromOffice.name}</p>
                <p><strong>Địa chỉ:</strong> {orderData.fromOffice.address}</p>
                <p><strong>Liên hệ:</strong> {orderData.fromOffice.phoneNumber}</p>
              </div>

              <div>
                <Title level={5}>Thông tin người nhận</Title>
                <p><strong>Tên:</strong> {orderData.recipientName}</p>
                <p><strong>SĐT:</strong> {orderData.recipientPhone}</p>
                <p><strong>Bưu cục nhận:</strong> {orderData.toOffice.name}</p>
                <p><strong>Địa chỉ:</strong> {orderData.toOffice.address}</p>
                <p><strong>Liên hệ:</strong> {orderData.toOffice.phoneNumber}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <Title level={5}>Thông tin hàng hóa</Title>
                <p><strong>Khối lượng:</strong> {orderData.weight} kg</p>
                <p><strong>Dịch vụ:</strong> {orderData.serviceType.name}</p>
                <p><strong>Thời gian giao:</strong> {orderData.serviceType.deliveryTime}</p>
              </div>

              <div>
                <Title level={5}>Chi phí</Title>
                <p><strong>Phí vận chuyển:</strong> {orderData.shippingFee.toLocaleString()} VNĐ</p>
                <p><strong>Thu hộ (COD):</strong> {orderData.cod.toLocaleString()} VNĐ</p>
                <p><strong>Giá trị hàng:</strong> {orderData.orderValue.toLocaleString()} VNĐ</p>
              </div>

              <div>
                <Title level={5}>Thời gian</Title>
                <p><strong>Ngày tạo:</strong> {new Date(orderData.createdAt).toLocaleDateString('vi-VN')}</p>
                {orderData.deliveredAt && (
                  <p><strong>Ngày giao:</strong> {new Date(orderData.deliveredAt).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
            </div>

            {orderData.notes && (
              <div style={{ marginBottom: 24 }}>
                <Title level={5}>Ghi chú</Title>
                <p>{orderData.notes}</p>
              </div>
            )}

            <div>
              <Title level={5}>Lịch sử vận chuyển</Title>
              <Timeline>
                {orderData.histories.map((history) => (
                  <Timeline.Item
                    key={history.id}
                    color={getStatusColor(history.status)}
                    dot={getStatusIcon(history.status)}
                  >
                    <div>
                      <Text strong>{getStatusText(history.status)}</Text>
                      <div style={{ color: "#666", fontSize: 12 }}>
                        {new Date(history.createdAt).toLocaleString('vi-VN')}
                      </div>
                      {history.notes && (
                        <div style={{ marginTop: 4 }}>{history.notes}</div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>
        )}
      </div>
      <FooterHome />
    </div>
  );
};

export default OrderTracking;
