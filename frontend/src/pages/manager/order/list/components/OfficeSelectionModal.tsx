import React, { useEffect } from 'react';
import { Modal, Form, Select, Typography, Card } from 'antd';
import { EnvironmentOutlined, ShopOutlined } from '@ant-design/icons';
import { Office } from '../../../../../types/office';
import { City, Ward } from '../../../../../types/location';

const { Text } = Typography;

interface OfficeSelectionModalProps {
  open: boolean;
  recipient: {
    detailAddress: string;
    wardCode: number;
    cityCode: number;
  };
  wardList: Ward[];
  provinceList: City[];
  offices: Office[];
  trackingNumber: string;
  onConfirm: (officeId: number) => void;
  onCancel: () => void;
}

const OfficeSelectionModal: React.FC<OfficeSelectionModalProps> = ({
  open,
  recipient,
  wardList,
  provinceList,
  offices,
  trackingNumber,
  onConfirm,
  onCancel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values.officeId);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  return (
    <Modal
      title={
        <Text strong style={{ color: '#1C3D90', fontSize: 18 }}>
          Xác nhận đơn hàng #{trackingNumber}
        </Text>
      }
      open={open}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText="Xác nhận"
      cancelText="Hủy"
      okButtonProps={{
        style: {
          backgroundColor: '#1C3D90',
          color: '#fff',
        },
      }}
      cancelButtonProps={{
        style: {
          backgroundColor: '#e0e0e0',
          color: '#333',
        },
      }}
      centered
      bodyStyle={{
        padding: '24px',
      }}
    >
      <Form form={form} layout="vertical">
        <Card 
          size="small" 
          style={{ 
            marginBottom: '20px',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            textAlign: 'left', 
            backgroundColor: '#f0f6ff',
          }}
          bodyStyle={{ 
            padding: '12px',
            textAlign: 'left', 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <EnvironmentOutlined style={{ 
              color: '#1C3D90', 
              fontSize: '16px', 
              marginTop: '2px' 
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#1C3D90',
                marginBottom: '4px',
                fontSize: '14px'
              }}>
                Địa chỉ người nhận
              </div>
              <Text style={{ 
                color: '#666',
                lineHeight: '1.5',
                fontSize: '14px',
                textAlign: 'left',
                display: 'block'
              }}>
                {recipient.detailAddress}, {wardList.find((w) => w.code === recipient.wardCode)?.name || ""}, {provinceList.find((w) => w.code === recipient.cityCode)?.name || ""}
              </Text>
            </div>
          </div>
        </Card>

        <Form.Item
          name="officeId"
          label={
            <div style={{ textAlign: 'left' }}>
              <ShopOutlined style={{ marginRight: '8px', color: '#1C3D90' }} />
              Chọn bưu cục nhận
            </div>
          }
          rules={[{ required: true, message: 'Vui lòng chọn bưu cục' }]}
          style={{ marginTop: 16, textAlign: 'left' }}
        >
          <Select 
            placeholder="Chọn bưu cục..."
            style={{ textAlign: 'left' }}
          >
            {offices.map((o) => (
              <Select.Option key={o.id} value={o.id}>
                {o.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OfficeSelectionModal;