import React from 'react';
import { Table, Button, Space, Tag, Switch } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { BankAccount } from '../../../../types/bankAccount';

interface BankAccountTableProps {
  data: BankAccount[];
  total: number;
  loading?: boolean;
  onEdit: (account: BankAccount) => void;
  onDelete: (accountId: number) => void;
  onSetDefault: (accountId: number) => void;
}

const BankAccountTable: React.FC<BankAccountTableProps> = ({
  data,
  total,
  loading = false,
  onEdit,
  onDelete,
  onSetDefault,
}) => {

  const columns: ColumnsType<BankAccount> = [
    { title: 'Tên ngân hàng', dataIndex: 'bankName', key: 'bankName', align: 'center' },
    { title: 'Số tài khoản', dataIndex: 'accountNumber', key: 'accountNumber', align: 'center' },
    { title: 'Tên chủ tài khoản', dataIndex: 'accountName', key: 'accountName', align: 'center' },
    {
      title: 'Mặc định',
      dataIndex: 'isDefault',
      key: 'isDefault',
      align: 'center',
      render: (val: boolean, record: BankAccount) => (
        <Switch
          checked={val}
          disabled={val} 
          onChange={() => onSetDefault(record.id)} 
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
        />
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      align: 'center',
      render: (text: string | null) => text || <Tag color='default'>N/A</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record: BankAccount) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)}>
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const tableData = data.map((p) => ({ ...p, key: p.id }));

  return (
    <>
      <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
        Kết quả trả về: {total} tài khoản
      </Tag>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        loading={loading}
        pagination={false}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      />
    </>
  );
};

export default BankAccountTable;