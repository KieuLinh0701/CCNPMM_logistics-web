import React from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import { product } from '../../../../types/product';

// Thêm CSS inline hoặc trong file CSS global
const scrollbarStyles = `
  .modal-hide-scrollbar .ant-modal-body {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  
  .modal-hide-scrollbar .ant-modal-body::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
`;

interface AddEditModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  product: Partial<product>;
  types: string[];
  onOk: () => void;
  onCancel: () => void;
  onProductChange: (product: Partial<product>) => void;
  form: any;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  open,
  mode,
  product,
  types,
  onOk,
  onCancel,
  onProductChange,
  form,
}) => {
  return (
    <>
      <style>{scrollbarStyles}</style>
      <Modal
        title={
          <span
            style={{
              color: '#1C3D90',
              fontWeight: 'bold',
              fontSize: '18px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {mode === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </span>
        }
        open={open}
        onOk={onOk}
        onCancel={onCancel}
        okText={mode === 'edit' ? 'Cập nhật' : 'Thêm'}
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
        bodyStyle={{
          maxHeight: '65vh',
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
        }}
        className="modal-hide-scrollbar" // Thêm class ở đây
      >
        <Form form={form} layout="vertical">
          {/* Các Form.Item giữ nguyên */}
          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]}>
            <Input
              value={product.name}
              onChange={(e) => onProductChange({ ...product, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Trọng lượng (kg)" name="weight" rules={[{ required: true, message: 'Nhập trọng lượng sản phẩm!' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={product.weight}
              onChange={(val) => onProductChange({ ...product, weight: val ?? 0 })}
            />
          </Form.Item>

          <Form.Item label="Giá sản phẩm (VNĐ)" name="price" rules={[{ required: true, message: 'Nhập giá sản phẩm!' }]}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              value={product.price}
              onChange={(val) => onProductChange({ ...product, price: val ?? 0 })}
            />
          </Form.Item>

          {mode !== 'edit' && (
            <Form.Item label="Tồn kho" name="stock">
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                value={product.stock}
                defaultValue={0}
                onChange={(val) => onProductChange({ ...product, stock: val ?? 0 })}
              />
            </Form.Item>
          )}

          <Form.Item label="Loại" name="type" rules={[{ required: true, message: 'Chọn loại sản phẩm!' }]}>
            <Select
              value={product.type}
              onChange={(val) => onProductChange({ ...product, type: val })}
              placeholder="Chọn loại..."
            >
              {types.map((t) => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Trạng thái" name="status">
            <Select
              value={product.status}
              onChange={(val) => onProductChange({ ...product, status: val as any })}
              defaultValue="Active"
            >
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddEditModal;