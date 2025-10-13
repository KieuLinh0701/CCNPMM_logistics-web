import React from "react";
import { Space, Button, Upload } from "antd";
import { PlusOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";

interface Props {
  onAdd: () => void;
}

const Actions: React.FC<Props> = ({ onAdd }) => {
  return (
    <Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Tạo đơn hàng</Button>
    </Space>
  );
};

export default Actions;