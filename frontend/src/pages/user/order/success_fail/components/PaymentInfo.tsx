import React from "react";
import { Order } from "../../../../../types/order";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus } from "../../../../../utils/orderUtils";

interface Props {
  order: Order;
  styles: { [key: string]: React.CSSProperties };
}

const PaymentInfo: React.FC<Props> = ({ order, styles }) => (
  <div style={styles.infoBox}>
    <h3>Thông tin thanh toán</h3>
    <p><strong>Phương thức:</strong> {translateOrderPaymentMethod(order.paymentMethod)}</p>
    <p><strong>Người thanh toán:</strong> {translateOrderPayer(order.payer)}</p>
    <p>
      <strong>Trạng thái: </strong>
      {(() => {
        switch (order.paymentStatus) {
          case "Paid":
            return <span style={{ color: "green", fontWeight: "bold" }}>{translateOrderPaymentStatus(order.paymentStatus)}</span>;
          case "Refunded":
            return <span style={{ color: "orange", fontWeight: "bold" }}>{translateOrderPaymentStatus(order.paymentStatus)}</span>;
          case "Unpaid":
          default:
            return <span style={{ color: "red", fontWeight: "bold" }}>{translateOrderPaymentStatus(order.paymentStatus)}</span>;
        }
      })()}
    </p>
  </div>
);

export default PaymentInfo;