import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import Actions from './components/Actions';
import BankAccountTable from './components/Table';
import AddEditModal from './components/AddEditModal';
import { addBankAccount, listBankAccounts, removeBankAccount, setDefaultBankAccount, updateBankAccount } from '../../../store/bankAccountSlice';
import { BankAccount } from '../../../types/bankAccount';
import BankNoticeCard from './components/BankNoticeCard';

interface Bank {
  name: string;
  short_name: string;
}

interface BankApiResponse {
  code: number;
  success: boolean;
  data: Bank[];
}

const BankAccounts: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [newBankAccount, setNewBankAccount] = useState<Partial<BankAccount>>({});
  const [form] = Form.useForm();

  const [bankNames, setBankNames] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const { accounts = [], total = 0 } = useAppSelector((state) => state.bankAccount);

  useEffect(() => {
    const fetchBankNames = async () => {
      try {
        const response = await axios.get<BankApiResponse>('https://api.banklookup.net/bank/list');
        const names = response.data.data.map((bank: any) => `${bank.name} (${bank.short_name})`);
        setBankNames(names);
      } catch (error) {
        console.error('Lấy danh sách ngân hàng thất bại:', error);
      }
    };

    fetchBankNames();
  }, []);

  // Handlers
  const handleAddBankAccount = async () => {
    await form.validateFields();
    try {
      const result = await dispatch(addBankAccount(newBankAccount)).unwrap();

      console.log("result", result)

      const successMessage = result?.message || 'Thêm tài khoản thành công!';
      if (result.success) {
        message.success(successMessage);
      } else {
        message.error(successMessage);
      }

      setIsModalOpen(false);
      setNewBankAccount({});
      form.resetFields();
      fetchBankAccounts();
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi thêm tài khoản!';
      message.error(errorMessage);
    }
  };

  const handleEditBankAccount = async () => {
    await form.validateFields();
    try {
      const result = await dispatch(updateBankAccount({ id: newBankAccount.id!, payload: newBankAccount })).unwrap();

      const successMessage = result?.message || 'Sửa tài khoản thành công!';
      if (result.success) {
        message.success(successMessage);
      } else {
        message.error(successMessage);
      }

      setIsModalOpen(false);
      setNewBankAccount({});
      form.resetFields();
      fetchBankAccounts();
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi sửa tài khoản!';
      message.error(errorMessage);
    }
  };

  // Xóa tài khoản
  const handleDeleteBankAccount = async (id: number) => {
    try {
      const result = await dispatch(removeBankAccount({ id })).unwrap();

      if (result.success) {
        message.success(result.message || 'Xóa tài khoản thành công!');
        fetchBankAccounts();
      } else {
        message.error(result.message || 'Xóa tài khoản thất bại!');
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi xóa tài khoản!';
      message.error(errorMessage);
    }
  };

  // Cập nhật mặc định tài khoản
  const handleSetDefaultBankAccount = async (id: number) => {
    try {
      const result = await dispatch(setDefaultBankAccount({ id })).unwrap();

      if (result.success) {
        message.success(result.message || 'Đặt tài khoản mặc định thành công!');
        fetchBankAccounts();
      } else {
        message.error(result.message || 'Cập nhật mặc định thất bại!');
      }
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi cập nhật mặc định!';
      message.error(errorMessage);
    }
  };

  const fetchBankAccounts = () => {
    dispatch(listBankAccounts());
  };

  useEffect(() => {
    fetchBankAccounts();
  }, [dispatch]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>

      <Actions
        onAdd={() => {
          setModalMode('create');
          setNewBankAccount({}); 
          form.resetFields();    
          form.setFieldsValue({
            isDefault: total === 0 ? true : false, 
          });
          setIsModalOpen(true);
        }}
        total={total}
      />

      <BankNoticeCard/>

      <BankAccountTable
        data={accounts}
        total={total}
        onEdit={(account) => {
          setModalMode('edit');
          setNewBankAccount(account);
          setIsModalOpen(true);
          form.setFieldsValue({
            ...account,
            isDefault: account.isDefault,
          });
        }}
        onDelete={handleDeleteBankAccount}
        onSetDefault={handleSetDefaultBankAccount}
      />

      <AddEditModal
        open={isModalOpen}
        mode={modalMode}
        account={newBankAccount}
        onOk={modalMode === 'edit' ? handleEditBankAccount : handleAddBankAccount}
        onCancel={() => setIsModalOpen(false)}
        onBankAccountChange={setNewBankAccount}
        form={form}
        total={total}
        bankNames={bankNames}
      />
    </div>
  );
};

export default BankAccounts;