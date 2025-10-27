import React from "react";
import { Order } from "../../../../../types/order";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus } from "../../../../../utils/orderUtils";
import Title from "antd/es/typography/Title";

interface Props {
  order: Order;
  totalServiceFee: number;
}

const PaymentInfo: React.FC<Props> = ({ order, totalServiceFee }) => (
  <div
    style={{
      display: "flex",
      gap: 60,
      flexWrap: "wrap",
      paddingLeft: 32,
      paddingRight: 32,
      paddingTop: 8,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      marginBottom: 32,
    }}
  >
    {/* Thông tin thanh toán */}
    <div style={{ flex: 1, minWidth: 220 }}>
      <Title level={5} style={{ color: "#1C3D90" }}>Thông tin thanh toán</Title>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Phương thức:</span>
        <span>{translateOrderPaymentMethod(order.paymentMethod)}</span>
      </div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Người thanh toán:</span>
        <span>{translateOrderPayer(order.payer)}</span>
      </div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Trạng thái:</span>
        <span style={{ color: "#8B6914", fontWeight: "bold" }}>{translateOrderPaymentStatus(order.paymentStatus)}</span>
      </div>
    </div>

    {/* Phí dịch vụ */}
    <div style={{ flex: 1, minWidth: 220 }}>
      <Title level={5} style={{ color: "#1C3D90" }}>Phí dịch vụ</Title>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Phí vận chuyển:</span>
        <span>{order.totalFee.toLocaleString()} VNĐ</span>
      </div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Giảm giá:</span>
        <span>{order.discountAmount.toLocaleString()} VNĐ</span>
      </div>
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
        <span>Tổng phí dịch vụ:</span>
        <span style={{ color: "#28a745", fontWeight: "bold" }}>{(order.totalFee - order.discountAmount).toLocaleString()} VNĐ</span>
      </div>
    </div>
  </div>
);

export default PaymentInfo;