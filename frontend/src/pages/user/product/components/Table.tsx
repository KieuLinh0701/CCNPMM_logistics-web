import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { product } from '../../../../types/product';

interface ProductTableProps {
  data: product[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onEdit: (product: product) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  data,
  currentPage,
  pageSize,
  total,
  loading = false,
  onEdit,
  onPageChange,
}) => {
  const statusTag = (status: string) => {
    switch (status) {
      case 'Active':
        return <Tag color="green">{status}</Tag>;
      case 'Inactive':
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  const columns: ColumnsType<product> = [
    { title: 'Mã SP', dataIndex: 'id', key: 'id', align: 'center' },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name', align: 'center' },
    { title: 'Trọng lượng (kg)', dataIndex: 'weight', key: 'weight', align: 'center' },
    { title: 'Giá sản phẩm (VNĐ)', dataIndex: 'price', key: 'price', align: 'center' },
    { title: 'Loại', dataIndex: 'type', key: 'type', align: 'center' },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      align: 'center', 
      render: (date) => dayjs(date).format('YYYY-MM-DD') 
    },
    { title: 'Tồn kho', dataIndex: 'stock', key: 'stock', align: 'center' },
    { title: 'Tổng bán', dataIndex: 'soldQuantity', key: 'soldQuantity', align: 'center' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'center', 
      render: (status) => statusTag(status) 
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record: product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const tableData = data.map((p, index) => ({
    ...p,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  return (
    <>
      <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px'}}>
        Kết quả trả về: {total} sản phẩm
      </Tag>
      
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: onPageChange,
        }}
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

export default ProductTable;