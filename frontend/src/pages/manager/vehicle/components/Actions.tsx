import React from 'react';
import { Button, Space, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';

interface ActionsProps {
  onAddVehicle: () => void;
  onImportExcel: (file: File) => boolean | Promise<boolean>;
  onDownloadTemplate: () => void;
}

const Actions: React.FC<ActionsProps> = ({
  onAddVehicle,
  onImportExcel,
  onDownloadTemplate,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
      {/* Title */}
      <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
        Quản lý phương tiện
      </Title>

      {/* Nút*/}
      <Space>
        <Button
          type="primary"
          style={{ backgroundColor: '#1976D2', borderColor: '#1976D2', height: 36, borderRadius: 8 }}
          icon={<PlusOutlined />}
          onClick={onAddVehicle}
        >
          Thêm phương tiện
        </Button>

        <Upload beforeUpload={onImportExcel} showUploadList={false}>
          <Button style={{ backgroundColor: '#43A047', color: '#fff', height: 36, borderRadius: 8 }} icon={<UploadOutlined />}>
            Nhập từ Excel
          </Button>
        </Upload>

        <Button
          style={{ backgroundColor: '#FB8C00', color: '#fff', height: 36, borderRadius: 8 }}
          icon={<DownloadOutlined />}
          onClick={onDownloadTemplate}
        >
          File mẫu
        </Button>
      </Space>
    </div>
  );
};

export default Actions;