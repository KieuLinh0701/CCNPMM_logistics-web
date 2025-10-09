import React from 'react';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { Order } from '../../../../../types/order';
import { useLocation } from 'react-router-dom';

interface OrderHeaderProps {
  order: Order;
  styles: { [key: string]: React.CSSProperties };
}

const Header: React.FC<OrderHeaderProps> = ({ order, styles }) => {
  const location = useLocation();

  // Kiểm tra URL xem có 'success' hay 'failed'
  const isSuccess = location.pathname.includes('/success/');
  const isFailed = location.pathname.includes('/failed/');
  return (
    <div style={styles.containerStyle}>
      {isSuccess && <CheckCircleTwoTone twoToneColor="#52c41a" style={styles.icon} />}
      {isFailed && <CloseCircleTwoTone twoToneColor="#ff4d4f" style={styles.icon} />}

      <h2 style={styles.title}>
        {isSuccess && (
          <>Đơn hàng với mã vận đơn <strong>#{order.trackingNumber}</strong>!</>
        )}
        {isFailed && (
          <>Thanh toán đơn hàng <strong>#{order.trackingNumber}</strong> thất bại!</>
        )}
      </h2>

      <p style={styles.subText}>
        {isSuccess && (
          order.paymentMethod === 'Cash'
            ? 'Đơn vị vận chuyển sẽ tới lấy hàng trong vòng 24 giờ kể từ khi tạo đơn hàng thành công'
            : 'Đơn vị vận chuyển sẽ tới lấy hàng trong vòng 24 giờ sau khi thanh toán thành công'
        )}
        {isFailed && (
          'Vui lòng thử thanh toán lại hoặc liên hệ bộ phận hỗ trợ.'
        )}
      </p>
    </div>
  );
};

export default Header;