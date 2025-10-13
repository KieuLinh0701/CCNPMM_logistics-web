import React from "react";
import { styles } from "../../style/Order.styles";
import { Order } from "../../../../../types/order";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus } from "../../../../../utils/orderUtils";

interface Props {
  order: Order;
  totalServiceFee: number;
}

const PaymentInfo: React.FC<Props> = ({ order, totalServiceFee }) => (
  <div style={styles.feeDetailsContainer}>
    <div style={styles.feeSection}>
      <div style={styles.paymentSummary}>
        <h3>Thông tin thanh toán</h3>
        <div style={styles.feeRow}><span>Phương thức:</span><span>{translateOrderPaymentMethod(order.paymentMethod)}</span></div>
        <div style={styles.feeRow}><span>Người thanh toán:</span><span>{translateOrderPayer(order.payer)}</span></div>
        <div style={styles.feeRow}><span>Trạng thái:</span><span style={{ color: "#8B6914", fontWeight: "bold" }}>{translateOrderPaymentStatus(order.paymentStatus)}</span></div>
      </div>

      <div style={styles.serviceFee}>
        <h3>Phí dịch vụ</h3>
        <div style={styles.feeRow}><span>Phí vận chuyển:</span><span>{order.shippingFee.toLocaleString()} VNĐ</span></div>
        <div style={styles.feeRow}><span>Giảm giá:</span><span>{order.discountAmount.toLocaleString()} VNĐ</span></div>
        <div style={styles.feeRow}><span>Tổng phí dịch vụ:</span>
          <span style={{ color: "#28a745", fontWeight: "bold" }}>{totalServiceFee.toLocaleString()} VNĐ</span>
        </div>
      </div>
    </div>
  </div>
);

export default PaymentInfo;