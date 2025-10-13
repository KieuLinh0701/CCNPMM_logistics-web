import React, { useEffect } from 'react';
import { Modal, Form, Select } from 'antd';
import { Office } from '../../../../../types/office';

interface OfficeSelectionModalProps {
    open: boolean;
    offices: Office[];
    trackingNumber: string;
    onConfirm: (officeId: number) => void;
    onCancel: () => void;
}

const OfficeSelectionModal: React.FC<OfficeSelectionModalProps> = ({
    open,
    offices,
    trackingNumber,
    onConfirm,
    onCancel,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.resetFields();
        }
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
                <span style={{
                    color: '#1C3D90',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    display: 'flex',
                    justifyContent: 'left',
                }}>
                    Xác nhận cho đơn hàng #{trackingNumber}
                </span>
            }
            open={open}
            onOk={handleConfirm}
            onCancel={onCancel}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{
                style: {
                    backgroundColor: "#1C3D90",
                    color: "#fff",
                },
            }}
            cancelButtonProps={{
                style: {
                    backgroundColor: "#e0e0e0",
                    color: "#333",
                },
            }}
            style={{ top: '50%', transform: 'translateY(-50%)' }} 
            bodyStyle={{ 
                padding: '24px 0',
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="officeId"
                    label="Chọn bưu cục nhận"
                    rules={[{ required: true, message: 'Vui lòng chọn bưu cục' }]}
                >
                    <Select placeholder="Chọn bưu cục...">
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