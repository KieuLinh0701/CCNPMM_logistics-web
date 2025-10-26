import React from "react";
import { Order } from "../../../../../types/order";
import { translateOrderStatus } from "../../../../../utils/orderUtils";
import { Tag } from "antd";
import Title from "antd/es/typography/Title";

interface Props {
  order: Order;
}

const OrderInfo: React.FC<Props> = ({ order }) => (
  <div style={{ paddingLeft: 32, paddingRight: 32, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
    <Title level={5} style={{ color: "#1C3D90" }}>Thông tin đơn hàng</Title>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 60 }}>
      {/* Cột 1 */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ marginBottom: 10 }}>
          <strong>Ngày tạo:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : <Tag>N/A</Tag>}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Ngày giao hàng:</strong> {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : <Tag>N/A</Tag>}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Trạng thái đơn hàng:</strong> {translateOrderStatus(order.status)}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Bưu cục gửi:</strong> {order.fromOffice?.name || <Tag>N/A</Tag>}
        </div>
      </div>

      {/* Cột 2 */}
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ marginBottom: 10 }}>
          <strong>Dịch vụ vận chuyển:</strong> {order.serviceType?.name || <Tag>N/A</Tag>}
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Trọng lượng:</strong> {order.weight} kg
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>Giá trị đơn hàng:</strong> {order.orderValue.toLocaleString()} VNĐ
        </div>
        <div style={{ marginBottom: 10 }}>
          <strong>COD:</strong> {order.cod?.toLocaleString() || 0} VNĐ
        </div>
      </div>
    </div>

    <div style={{ marginTop: 2 }}>
      <strong>Ghi chú:</strong> {order.notes || <Tag>N/A</Tag>}
    </div>
  </div>
);

export default OrderInfo;