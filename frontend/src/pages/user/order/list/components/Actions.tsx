import React from "react";
import { Space, Button, Upload } from "antd";
import { PlusOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import Title from "antd/es/typography/Title";

interface Props {
  onAdd: () => void;
  onUpload: (file: File) => boolean;
  onDownloadTemplate: () => void;
}

const Actions: React.FC<Props> = ({ onAdd, onUpload, onDownloadTemplate }) => {
  return (
    <Space>
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Tạo đơn hàng</Button>
      <Upload beforeUpload={onUpload} showUploadList={false}>
        <Button style={{ backgroundColor: "#43A047", color: "#fff" }} icon={<UploadOutlined />}>Nhập từ Excel</Button>
      </Upload>
      <Button style={{ backgroundColor: "#FB8C00", color: "#fff" }} icon={<DownloadOutlined />} onClick={onDownloadTemplate}>File mẫu</Button>
    </Space>
  );
};

export default Actions;