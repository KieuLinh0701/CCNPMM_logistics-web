import React from "react";
import { styles } from "../../style/Order.styles";
import { Order } from "../../../../../types/order";

interface Props {
  order: Order;
  totalServiceFee: number;
}

const PaymentInfo: React.FC<Props> = ({ order, totalServiceFee }) => (
  <div style={styles.feeDetailsContainer}>
    <div style={styles.feeSection}>
      <div style={styles.paymentSummary}>
        <h3>Thông tin thanh toán</h3>
        <div style={styles.feeRow}><span>Phương thức:</span><span>{order.paymentMethod}</span></div>
        <div style={styles.feeRow}><span>Người thanh toán:</span><span>{order.payer === "Customer" ? "Người nhận" : "Người gửi"}</span></div>
        <div style={styles.feeRow}><span>Trạng thái:</span>
          {(() => {
            switch (order.paymentStatus) {
              case "Paid":
                return <span style={{ color: "green" }}>Đã thanh toán</span>;
              case "Refunded":
                return <span style={{ color: "orange" }}>Đã hoàn tiền</span>;
              case "Unpaid":
              default:
                return <span style={{ color: "red" }}>Chưa thanh toán</span>;
            }
          })()}
        </div>
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