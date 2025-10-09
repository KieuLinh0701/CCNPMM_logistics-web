import React from "react";
import { Order } from "../../../../../types/order";

interface Props {
  order: Order;
  styles: { [key: string]: React.CSSProperties };
}

const PaymentInfo: React.FC<Props> = ({ order, styles }) => (
  <div style={styles.infoBox}>
    <h3>Thông tin thanh toán</h3>
    <p><strong>Phương thức:</strong> {order.paymentMethod}</p>
    <p><strong>Người thanh toán:</strong> {order.payer === "Customer" ? "Người nhận" : "Người gửi"}</p>
    <p>
      <strong>Trạng thái: </strong>
      {(() => {
        switch (order.paymentStatus) {
          case "Paid":
            return <span style={{ color: "green", fontWeight: "bold" }}>Đã thanh toán</span>;
          case "Refunded":
            return <span style={{ color: "orange", fontWeight: "bold" }}>Đã hoàn tiền</span>;
          case "Unpaid":
          default:
            return <span style={{ color: "red", fontWeight: "bold" }}>Chưa thanh toán</span>;
        }
      })()}
    </p>
  </div>
);

export default PaymentInfo;