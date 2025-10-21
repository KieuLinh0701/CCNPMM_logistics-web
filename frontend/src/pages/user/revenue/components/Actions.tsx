import React from "react";
import { Space, Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

interface Props {
  onExport: () => void;
}

const Actions: React.FC<Props> = ({ onExport }) => {
  return (
    <Space>
      <Button
        style={{
          backgroundColor: '#1C3D90', 
          color: 'white',
          border: 'none',
        }}
        icon={<FileExcelOutlined />}
        onClick={onExport}
      >
        Xuất Excel
      </Button>

    </Space>
  );
};

export default Actions;