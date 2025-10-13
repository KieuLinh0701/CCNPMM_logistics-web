import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Alert } from 'antd';
import type { Rule } from 'antd/es/form';
import { ShippingRequest } from '../../../../../types/shippingRequest';
import { translateRequestType } from '../../../../../utils/shippingRequestUtils';

interface AddEditModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  request: Partial<ShippingRequest>;
  requestTypes: string[];
  onOk: () => void;
  onCancel: () => void;
  onRequestChange: (request: Partial<ShippingRequest>) => void;
  form: any;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  open,
  mode,
  request,
  requestTypes,
  onOk,
  onCancel,
  onRequestChange,
  form,
}) => {
  const [selectedRequestType, setSelectedRequestType] = useState<string>('');

  const handleOk = async () => {
    try {
      await form.validateFields();
      onOk();
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  // Đồng bộ form values khi request thay đổi
  useEffect(() => {
    if (open && request) {
      const requestType = request.requestType || undefined;
      setSelectedRequestType(requestType || '');
      form.setFieldsValue({
        id: request.id,
        trackingNumber: request.order?.trackingNumber,
        requestType: requestType,
        requestContent: request.requestContent,
      });
    }
  }, [open, request, form]);

  // Xử lý khi form values thay đổi
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.requestType) {
      setSelectedRequestType(changedValues.requestType);
    }

    const updatedRequest: Partial<ShippingRequest> = {
      ...request,
      ...allValues,
      order: {
        ...request.order,
        trackingNumber: allValues.trackingNumber
      }
    };
    onRequestChange(updatedRequest);
  };

  // Kiểm tra có cần trackingNumber không
  const requiresTrackingNumber = !!selectedRequestType &&
    !['Inquiry', 'Complaint'].includes(selectedRequestType);

  // Kiểm tra có cần content không - BAN ĐẦU KHÔNG BẮT BUỘC
  const requiresContent = selectedRequestType && selectedRequestType !== 'DeliveryReminder';

  // Render thông báo hướng dẫn
  const renderInstructions = () => {
    if (!selectedRequestType) return null;

    const instructions = {
      Inquiry: 'Yêu cầu hỗ trợ: Có thể để trống mã đơn hàng',
      Complaint: 'Yêu cầu khiếu nại: Có thể để trống mã đơn hàng',
      DeliveryReminder: 'Yêu cầu hối giao hàng: Có thể để trống nội dung',
      ChangeOrderInfo: 'Yêu cầu thay đổi thông tin: Bắt buộc có mã đơn hàng và nội dung cần thay đổi'
    };

    return (
      <Alert
        message={instructions[selectedRequestType as keyof typeof instructions]}
        type="info"
        showIcon
        style={{ marginBottom: 16, fontSize: '13px' }}
      />
    );
  };

  const getContentRules = (): Rule[] => {
    if (!selectedRequestType) {
      return []; 
    }
    
    const rules: Rule[] = [];
    
    if (requiresContent) {
      rules.push({
        required: true,
        message: 'Nhập nội dung yêu cầu!'
      });
    }
    
    rules.push({
      max: 1000,
      message: 'Nội dung không được vượt quá 1000 ký tự!'
    });
    
    return rules;
  };

  return (
    <Modal
      title={
        <span
          style={{
            color: '#1C3D90',
            fontWeight: 'bold',
            fontSize: '18px',
            display: 'flex',
            justifyContent: 'left',
          }}
        >
          {mode === 'edit' ? `Chỉnh sửa yêu cầu #${request.id}` : 'Tạo yêu cầu mới'}
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={mode === 'edit' ? 'Cập nhật' : 'Tạo'}
      okButtonProps={{
        style: {
          backgroundColor: '#1C3D90',
          borderRadius: '8px',
          color: '#fff',
        },
      }}
      cancelButtonProps={{
        style: {
          border: '1px solid #1C3D90',
          borderRadius: '8px',
          color: '#1C3D90',
        },
      }}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >

        {/* Hiển thị thông báo hướng dẫn */}
        {renderInstructions()}

        <Form.Item
          label="Mã đơn hàng"
          name="trackingNumber"
          rules={[
            {
              required: requiresTrackingNumber, 
              message: 'Nhập mã đơn hàng!'
            }
          ]}
        >
          <Input
            disabled={mode === 'edit'}
            placeholder="Nhập mã đơn hàng..."
          />
        </Form.Item>

        <Form.Item
          label="Loại yêu cầu"
          name="requestType"
          rules={[{ required: true, message: 'Chọn loại yêu cầu!' }]}
        >
          <Select
            placeholder="Chọn loại yêu cầu..."
            disabled={mode === 'edit'}
            onChange={(value) => setSelectedRequestType(value)}
          >
            {requestTypes.map((type) => (
              <Select.Option key={type} value={type}>
                {translateRequestType(type)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Nội dung yêu cầu"
          name="requestContent"
          rules={getContentRules()} // Sử dụng dynamic rules
        >
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder={
              selectedRequestType === 'DeliveryReminder' 
                ? "Nội dung không bắt buộc cho yêu cầu hối giao hàng..."
                : "Nhập nội dung yêu cầu..."
            }
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditModal;