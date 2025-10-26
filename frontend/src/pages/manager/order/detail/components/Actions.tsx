import React from "react";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

interface Props {
  canApprove: boolean;
  canEdit: boolean;
  canCancel: boolean;
  hasPaymentIssue: boolean;
  onEdit: (trackingNumber?: string) => void;
  onCancel: (id?: string) => void;
  onApprove: (record?: any) => void;
  record?: any;
}

const Actions: React.FC<Props> = ({
  canApprove,
  canEdit,
  canCancel,
  hasPaymentIssue,
  onEdit,
  onCancel,
  onApprove,
  record,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        justifyContent: "flex-end",
        paddingLeft: 32,
        paddingRight: 32,
        paddingBottom: 32,
      }}
    >
      {/* ✅ Nút Sửa — chỉ hiện khi không thể duyệt */}
      {!canApprove && (
        <button
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: canEdit ? "none" : "1px solid #ccc",
            backgroundColor: canEdit ? "#ef9f09" : "#f0f0f0",
            color: canEdit ? "#333" : "#999",
            cursor: canEdit ? "pointer" : "not-allowed",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
          disabled={!canEdit}
          onClick={() => canEdit && onEdit(record?.trackingNumber)}
          onMouseEnter={(e) =>
            canEdit && (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) =>
            canEdit && (e.currentTarget.style.filter = "brightness(1)")
          }
        >
          <EditOutlined /> Chỉnh sửa
        </button>
      )}

      {/* ✅ Nút Duyệt — chỉ hiện khi có thể duyệt */}
      {canApprove && (
        <button
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: hasPaymentIssue ? "#f0f0f0" : "#1C3D90",
            color: hasPaymentIssue ? "#999" : "#fff",
            cursor: hasPaymentIssue ? "not-allowed" : "pointer",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.2s ease",
          }}
          disabled={hasPaymentIssue}
          onClick={() => !hasPaymentIssue && onApprove(record)}
          onMouseEnter={(e) =>
            !hasPaymentIssue && (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) =>
            !hasPaymentIssue && (e.currentTarget.style.filter = "brightness(1)")
          }
        >
          <CheckCircleOutlined /> Duyệt
        </button>
      )}

      {/* ✅ Nút Hủy — luôn hiện */}
      <button
        style={{
          padding: "12px 20px",
          borderRadius: 8,
          border: canCancel ? "none" : "1px solid #ccc",
          backgroundColor: canCancel ? "#a8071a" : "#f0f0f0",
          color: canCancel ? "#fff" : "#999",
          cursor: canCancel ? "pointer" : "not-allowed",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.2s ease",
        }}
        disabled={!canCancel}
        onClick={() => canCancel && onCancel(record?.id)}
        onMouseEnter={(e) =>
          canCancel && (e.currentTarget.style.filter = "brightness(1.1)")
        }
        onMouseLeave={(e) =>
          canCancel && (e.currentTarget.style.filter = "brightness(1)")
        }
      >
        <CloseCircleOutlined /> Hủy
      </button>
    </div>
  );
};

export default Actions;