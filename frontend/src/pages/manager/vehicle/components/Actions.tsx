import React from 'react';
import { Button, Space, Upload } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';

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
    <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
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
          <Button style={{ backgroundColor: '#43A047', color: '#fff' }} icon={<UploadOutlined />}>
            Nhập từ Excel
          </Button>
        </Upload>
        <Button 
          style={{ backgroundColor: '#FB8C00', color: '#fff' }} 
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