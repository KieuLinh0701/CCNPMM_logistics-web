import React, { useEffect } from "react";
import { Modal, Form, Select, Input, Button } from "antd";
import { PaymentSubmission } from "../../../../../types/paymentSubmission";
import { translateTransactionStatus } from "../../../../../utils/transactionUtils";

const { TextArea } = Input;

interface Props {
  visible: boolean;
  submission: PaymentSubmission | null;
  onClose: () => void;
  onSubmit: (status: string, notes: string) => Promise<void>;
}

const ProcessPaymentSubmissionModal: React.FC<Props> = ({ visible, submission, onClose, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (submission) {
      form.setFieldsValue({
        status: undefined, // để bắt buộc chọn trạng thái mới
        notes: "",
      });
    }
  }, [submission, form]);

  const getAvailableStatuses = () => {
    switch (submission?.status) {
      case "Pending":
        return ["Confirmed", "Rejected"];
      case "Rejected":
        return ["Adjusted"];
      default:
        return [];
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values.status, values.notes);
      form.resetFields();
      onClose();
    } catch (error) {
      // validateFields sẽ tự show lỗi
    }
  };

  return (
    <Modal
      centered
      title={<span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '17px' }}>Đối soát #{submission?.id || ""}</span>}
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          style={{ borderColor: "#1C3D90", color: "#1C3D90" }}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          style={{ backgroundColor: "#1C3D90", color: "#fff" }}
        >
          Xác nhận
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Trạng thái mới"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái mới" }]}
        >
          <Select
            placeholder="Chọn trạng thái mới..."
            options={getAvailableStatuses().map((s) => ({
              label: translateTransactionStatus(s),
              value: s,
            }))}
          />
        </Form.Item>

        <Form.Item label="Ghi chú (nếu có)" name="notes">
          <TextArea rows={4} placeholder="Nhập ghi chú..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProcessPaymentSubmissionModal;