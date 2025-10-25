import React, { useState, useEffect } from "react";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { styles } from "../../../../user/order/style/Order.styles";

interface Props {
  onEdit: () => void;
  onCancel: () => void;
  status: string;
}

const Actions: React.FC<Props> = ({
  onEdit,
  onCancel,
  status,
}) => {

  const handleEditClick = () => {
    // Chỉ gọi onEdit để lưu tất cả thay đổi (bao gồm status đã được cập nhật trước đó)
    onEdit();
  };

  return (
    <div
      style={{
        ...styles.buttonGroup,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 16,
        width: "100%",
        maxWidth: 330,
        marginLeft: "auto",
      }}
    >
      {/* Hàng nút */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: "8px",
        }}
      >
        <button
          style={{
            ...styles.buttonActionEdit,
            backgroundColor: "#1C3D90",
            color: "#fff",
            width: "55%",
          }}
          onClick={handleEditClick}
        >
          <EditOutlined style={{ marginRight: 6 }} /> Chỉnh sửa
        </button>

        <button
          style={{
            ...styles.buttonActionEdit,
            width: "45%",
          }}
          onClick={onCancel}
        >
          <CloseCircleOutlined style={{ marginRight: 6 }} />
          Hủy
        </button>
      </div>
    </div>
  );
};

export default Actions;