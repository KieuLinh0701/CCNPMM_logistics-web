import React from 'react';
import { Modal, Form, Input, Switch, AutoComplete, message } from 'antd';
import { BankAccount } from '../../../../types/bankAccount';

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
  account: Partial<BankAccount>;
  onOk: () => void;
  onCancel: () => void;
  onBankAccountChange: (account: Partial<BankAccount>) => void;
  form: any;
  bankNames: string[];
  total: number;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  open,
  mode,
  account,
  onOk,
  onCancel,
  onBankAccountChange,
  form,
  bankNames,
  total,
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
            {mode === 'edit' ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
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
        className="modal-hide-scrollbar"
      >
        <Form form={form} layout="vertical">
          {/* Tên ngân hàng */}
          <Form.Item
            label="Tên ngân hàng"
            name="bankName"
            rules={[{ required: true, message: 'Nhập tên ngân hàng!' }]}
          >
            <AutoComplete
              options={bankNames.map((name) => ({ value: name }))}
              placeholder="Chọn hoặc nhập tên ngân hàng"
              value={account.bankName}
              onChange={(value) => onBankAccountChange({ ...account, bankName: value })}
              filterOption={(inputValue, option) =>
                option!.value.toLowerCase().includes(inputValue.toLowerCase())
              }
              style={{ width: '100%' }}
            />
          </Form.Item>

          {/* Số tài khoản chỉ được nhập số, hiển thị lỗi nếu không phải số */}
          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[
              { required: true, message: 'Nhập số tài khoản!' },
              {
                validator: (_, value) => {
                  if (!value || /^[0-9]+$/.test(value)) {
                    return Promise.resolve(); // hợp lệ
                  }
                  return Promise.reject(new Error('Số tài khoản chỉ được chứa số!')); // lỗi
                },
              },
            ]}
          >
            <Input
              value={account.accountNumber}
              onChange={(e) => onBankAccountChange({ ...account, accountNumber: e.target.value })}
            />
          </Form.Item>

          {/* Tên chủ tài khoản: tự động in hoa */}
          <Form.Item
            label="Tên chủ tài khoản"
            name="accountName"
            rules={[{ required: true, message: 'Nhập tên chủ tài khoản!' }]}
          >
            <Input
              value={account.accountName}
              onChange={(e) => {
                const upperCaseValue = e.target.value.toLocaleUpperCase('vi-VN');
                form.setFieldsValue({ accountName: upperCaseValue });
                onBankAccountChange({ ...account, accountName: upperCaseValue });
              }}
            />
          </Form.Item>

          {/* Mặc định */}
          <Form.Item
            label="Đặt mặc định"
            name="isDefault"
            valuePropName="checked"
          >
            <Switch
              disabled={
                mode === 'edit' && account.isDefault
              }
              onChange={(val) => {
                if (mode === 'edit' && account.isDefault && !val) {
                  message.warning('Vui lòng chọn 1 tài khoản mặc định khác');
                  return;
                }
                onBankAccountChange({ ...account, isDefault: val });
              }}
            />
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea
              value={account.notes}
              onChange={(e) => onBankAccountChange({ ...account, notes: e.target.value })}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddEditModal;