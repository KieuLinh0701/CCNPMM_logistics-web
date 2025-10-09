import React from "react";
import { CloseCircleOutlined, CreditCardOutlined, EditOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { styles } from "../../style/Order.styles";

interface Props {
  canPublic: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canPay: boolean;
  onPublic: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onPay: () => void;
}

const Actions: React.FC<Props> = ({ canPublic, canEdit, canCancel, canPay, onPublic, onEdit, onCancel, onPay }) => (
  <div style={styles.buttonGroup}>
    <button
      style={{
        ...styles.button,
        backgroundColor: canEdit ? '#ef9f09ff' : '#f0f0f0',
        color: canEdit ? '#333' : '#999',
        cursor: canEdit ? 'pointer' : 'not-allowed',
        border: canEdit ? 'none' : '1px solid #ccc',
      }}
      onClick={canEdit ? onEdit : undefined}
    >
      <EditOutlined style={{ marginRight: 6 }} /> Chỉnh sửa
    </button>

    <button
      style={{
        ...styles.button,
        backgroundColor: canCancel ? '#a8071a' : '#f0f0f0',
        color: canCancel ? '#fff' : '#999',
        cursor: canCancel ? 'pointer' : 'not-allowed',
        border: canCancel ? 'none' : '1px solid #ccc',
      }}
      onClick={canCancel ? onCancel : undefined}
    >
      <CloseCircleOutlined style={{ marginRight: 6 }} /> Hủy
    </button>

    {canPay && (
      <button
        style={{
          ...styles.button,
          backgroundColor: '#0b942eff',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={onPay}
      >
        <CreditCardOutlined style={{ marginRight: 6 }} /> Thanh toán
      </button>
    )}

    {canPublic && (
      <button
        style={{
          ...styles.button,
          backgroundColor: '#1C3D90',
          color: '#fff',
          cursor: 'pointer',
        }}
        onClick={onPublic}
      >
        <PlayCircleOutlined style={{ marginRight: 6 }} /> Chuyển xử lý
      </button>
    )}
  </div>
);

export default Actions;