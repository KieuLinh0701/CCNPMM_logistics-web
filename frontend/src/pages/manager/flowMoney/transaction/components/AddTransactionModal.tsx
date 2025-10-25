import React, { useEffect, useState } from "react";
import { Modal, Form, InputNumber, Select, Upload, Button, message, Input, Row, Col } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UploadFile } from "antd/es/upload/interface";
import { translateTransactionType } from "../../../../../utils/transactionUtils";
import { styles } from "../../../../user/order/style/Order.styles";

const { Option } = Select;

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  types: string[];
  onSubmit: (data: any) => Promise<void>;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ visible, onClose, onSubmit, types }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      form.resetFields(); 
    }
  }, [visible, form]);

  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const handleFinish = async (values: any) => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn ít nhất 1 ảnh hóa đơn");
      return;
    }

    if (fileList.length > 5) {
      message.error("Bạn chỉ có thể chọn tối đa 5 ảnh hóa đơn. Vui lòng xóa bớt trước khi thêm.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ ...values, images: fileList.map(f => f.originFileObj) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '17px' }}>Thêm giao dịch mới</span>}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button
          key="cancel"
          onClick={onClose}
          style={{
            borderColor: "#1C3D90",
            color: "#1C3D90",
          }}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
          style={{
            backgroundColor: "#1C3D90",
            color: "#fff",
          }}
        >
          Thêm
        </Button>,
      ]}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 18 }}>
        <Form.Item
          label="Tiêu đề"
          name="title"
        >
          <Input
            placeholder="Nhập tiêu đề (sẽ giúp quản trị viên xử lý nhanh)..."
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label="Số tiền (VNĐ)"
          name="amount"
          rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
        >
          <InputNumber
            placeholder="Nhập số tiền..."
            min={0}
            step={1000}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="notes"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <Input.TextArea
            placeholder="Nhập mô tả..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>

        <Form.Item
          name="images"
          label="Hóa đơn (tối đa 5 ảnh)"
        >
          <Upload
            multiple
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // Giữ nguyên fileList
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTransactionModal;