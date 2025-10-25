import React from "react";
import { CheckOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button } from "antd";

interface Props {
  onCreate: () => void;
  loading?: boolean;
}

const Actions: React.FC<Props> = ({
  onCreate,
  loading = false,
}) => {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: "8px",
        }}
      >

        <Button
          type="primary"
          block
          style={{ background: "#1C3D90", color: "#ffffff" }}
          icon={<CheckOutlined />}
          onClick={() => onCreate()}
          loading={loading}
        >
          Tạo đơn
        </Button>
      </div>
    </div>
  );
};

export default Actions;