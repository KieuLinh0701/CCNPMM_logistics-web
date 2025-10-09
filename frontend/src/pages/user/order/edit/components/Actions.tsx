import React, { useState, useEffect } from "react";
import { CloseCircleOutlined, EditOutlined } from "@ant-design/icons";
import { Switch } from "antd";
import { styles } from "../../style/Order.styles";

interface Props {
  onEdit: () => void;
  onCancel: () => void;
  onStatusChange: (status: "draft" | "pending") => void;
  status: string;
}

const Actions: React.FC<Props> = ({
  onEdit,
  onCancel,
  onStatusChange,
  status,
}) => {
  const [isOn, setIsOn] = useState(status === "pending");
  const [tempStatus, setTempStatus] = useState<"draft" | "pending">(
    status === "pending" ? "pending" : "draft"
  );

  useEffect(() => {
    setIsOn(status === "pending");
    setTempStatus(status === "pending" ? "pending" : "draft");
  }, [status]);

  const handleToggle = (checked: boolean) => {
    setIsOn(checked);
    const newStatus = checked ? "pending" : "draft";
    setTempStatus(newStatus);
    // Chỉ thay đổi status local, không gọi API
    onStatusChange(newStatus);
  };

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
      {/* Hàng switch */}
      {status === "draft" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span style={{ fontWeight: 500 }}>Chuyển sang công khai</span>
          <Switch
            checked={isOn}
            onChange={handleToggle}
            checkedChildren=""
            unCheckedChildren=""
            style={{
              backgroundColor: isOn ? "#1C3D90" : "#d9d9d9",
              boxShadow: "none",
              transform: "scale(1.05)",
            }}
          />
        </div>
      )}

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