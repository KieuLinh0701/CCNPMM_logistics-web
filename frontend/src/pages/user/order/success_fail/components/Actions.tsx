import React from 'react';
import { EyeOutlined, EditOutlined, CreditCardOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../../../../types/order';

interface OrderActionsProps {
  order: Order;
  styles: { [key: string]: React.CSSProperties };
  handleViewDetails: () => void;
  handlePayment: () => void;
  handleCancelOrder: () => void;
  role: string;
}

const Actions: React.FC<OrderActionsProps> = ({
  order,
  styles,
  handleViewDetails,
  handlePayment,
  handleCancelOrder,
  role,
}) => {
  const navigate = useNavigate();

  const canEdit = ['draft', 'pending', 'confirmed'].includes(order.status);
  const canCancel = ["draft", "pending", "confirmed"].includes(order.status) && order.createdByType === "user";
  const canPay = ['pending'].includes(order.status);

  return (
    <div style={styles.buttonGroup}>
      <button style={styles.button} onClick={handleViewDetails}>
        <EyeOutlined style={{ marginRight: 6 }} />
        Xem chi tiết
      </button>

      <button
        style={{
          ...styles.button,
          backgroundColor: canEdit ? '#ef9f09ff' : '#f0f0f0',
          color: canEdit ? '#333' : '#999',
          cursor: canEdit ? 'pointer' : 'not-allowed',
          border: canEdit ? 'none' : '1px solid #ccc',
        }}
        onClick={canEdit ? () => navigate(`/${role}/orders/edit/${order.trackingNumber}`) : undefined}
      >
        <EditOutlined style={{ marginRight: 6 }} />
        Chỉnh sửa
      </button>

      {order.paymentMethod !== 'Cash' && order.paymentStatus === 'Unpaid' && canPay && (
        <button
          style={{ ...styles.button, backgroundColor: '#0b942eff', color: '#fff' }}
          onClick={handlePayment}
        >
          <CreditCardOutlined style={{ marginRight: 6 }} />
          Thanh toán
        </button>
      )}

      <button
        style={{
          ...styles.button,
          backgroundColor: canCancel ? '#a8071a' : '#f0f0f0',
          color: canCancel ? '#fff' : '#999',
          cursor: canCancel ? 'pointer' : 'not-allowed',
          border: canCancel ? 'none' : '1px solid #ccc',
        }}
        onClick={canCancel && order.id !== undefined ? handleCancelOrder : undefined}
      >
        <CloseCircleOutlined style={{ marginRight: 6 }} />
        Hủy
      </button>
    </div>
  );
};

export default Actions;