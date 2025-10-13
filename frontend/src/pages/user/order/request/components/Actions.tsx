import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface ActionsProps {
  total: number;
  onAddRequest: () => void;
}

const Actions: React.FC<ActionsProps> = ({
  total,
  onAddRequest,
}) => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div></div> 
        
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: '#1976D2', borderColor: '#1976D2', height: 36, borderRadius: 8 }}
            icon={<PlusOutlined />}
            onClick={onAddRequest}
          >
            Tạo yêu cầu
          </Button>
        </Space>
      </div>
    </>
  );
};

export default Actions;