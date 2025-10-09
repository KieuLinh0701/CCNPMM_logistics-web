import React from "react";
import { styles } from "../../style/Order.styles";
import { Order } from "../../../../../types/order";
import { translateOrderStatus } from "../../../../../utils/orderUtils";

interface Props {
  order: Order;
}

const OrderInfo: React.FC<Props> = ({ order }) => (
  <div style={styles.paymentAndDetailsContainer}>
    <div style={styles.orderInfo}> {/* Áp dụng khung cho cả h3 và nội dung */}
      <h3>Thông tin đơn hàng</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', paddingRight: '40px' }}>
          <p style={styles.feeRow}>
            <span><strong>Ngày tạo:</strong></span>
            <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "---"}</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>Ngày giao hàng:</strong></span>
            <span>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : "---"}</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>Trạng thái đơn hàng:</strong></span>
            <span>{translateOrderStatus(order.status)}</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>Bưu cục gửi:</strong></span>
            <span>{order.fromOffice.name || "---"}</span>
          </p>
        </div>

        <div style={{ flex: 1, minWidth: '200px', borderLeft: '2px solid #e8e8e8', paddingLeft: '40px' }}>
          <p style={styles.feeRow}>
            <span><strong>Dịch vụ vận chuyển:</strong></span>
            <span>{order.serviceType.name}</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>Trọng lượng:</strong></span>
            <span>{order.weight} kg</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>Giá trị đơn hàng:</strong></span>
            <span>{order.orderValue.toLocaleString()} VNĐ</span>
          </p>
          <p style={styles.feeRow}>
            <span><strong>COD:</strong></span>
            <span>{order.cod?.toLocaleString()} VNĐ</span>
          </p>
        </div>
      </div>
      <p><strong>Ghi chú:</strong> {order.notes || "---"}</p>
    </div>
  </div>
);

export default OrderInfo;