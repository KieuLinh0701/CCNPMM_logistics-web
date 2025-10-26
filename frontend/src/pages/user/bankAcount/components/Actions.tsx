import React from 'react';
import { Button, Space, Upload, Tag } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';

interface ActionsProps {
  onAdd: () => void;
  total: number;
}

const Actions: React.FC<ActionsProps> = ({
  onAdd, total
}) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
          Danh sách tài khoản
        </Title>
        <Button
          type="primary"
          style={{ color: 'white', backgroundColor: '#1C3D90', height: 36, borderRadius: 8 }}
          icon={<PlusOutlined />}
          onClick={onAdd}
          disabled={total >= 5}
        >
          Thêm tài khoản
        </Button>
      </div>
    </>
  );
};

export default Actions;