import React from "react";
import { CloseCircleOutlined, CreditCardOutlined, EditOutlined, PlayCircleOutlined } from "@ant-design/icons";

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
  <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
  }}>

    <button
      style={{
        padding: '12px 20px',
        borderRadius: 8,
        border: canEdit ? 'none' : '1px solid #ccc',
        backgroundColor: canEdit ? '#ef9f09' : '#f0f0f0',
        color: canEdit ? '#333' : '#999',
        cursor: canEdit ? 'pointer' : 'not-allowed',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease',
      }}
      onClick={canEdit ? onEdit : undefined}
      onMouseEnter={(e) => canEdit && (e.currentTarget.style.filter = 'brightness(1.1)')}
      onMouseLeave={(e) => canEdit && (e.currentTarget.style.filter = 'brightness(1)')}
    >
      <EditOutlined /> Chỉnh sửa
    </button>

    <button
      style={{
        padding: '12px 20px',
        borderRadius: 8,
        border: canCancel ? 'none' : '1px solid #ccc',
        backgroundColor: canCancel ? '#a8071a' : '#f0f0f0',
        color: canCancel ? '#fff' : '#999',
        cursor: canCancel ? 'pointer' : 'not-allowed',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.2s ease',
      }}
      onClick={canCancel ? onCancel : undefined}
      onMouseEnter={(e) => canCancel && (e.currentTarget.style.filter = 'brightness(1.1)')}
      onMouseLeave={(e) => canCancel && (e.currentTarget.style.filter = 'brightness(1)')}
    >
      <CloseCircleOutlined /> Hủy
    </button>

    {canPay && (
      <button
        style={{
          padding: '12px 20px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#0b942e',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
        }}
        onClick={onPay}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
      >
        <CreditCardOutlined /> Thanh toán
      </button>
    )}

    {canPublic && (
      <button
        style={{
          padding: '12px 20px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#1C3D90',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
        }}
        onClick={onPublic}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
      >
        <PlayCircleOutlined /> Chuyển xử lý
      </button>
    )}

  </div>
);

export default Actions;