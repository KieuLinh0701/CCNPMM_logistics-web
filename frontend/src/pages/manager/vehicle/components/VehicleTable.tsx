import React from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Vehicle } from '../../../../types/vehicle';

interface VehicleTableProps {
  data: Vehicle[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onPageChange: (page: number, pageSize?: number) => void;
}

const VehicleTable: React.FC<VehicleTableProps> = ({
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
      case 'Available':
        return <Tag color="green">Khả dụng</Tag>;
      case 'InUse':
        return <Tag color="blue">Đang sử dụng</Tag>;
      case 'Maintenance':
        return <Tag color="orange">Bảo trì</Tag>;
      default:
        return <Tag color="gray">{status}</Tag>;
    }
  };

  const typeTag = (type: string) => {
    switch (type) {
      case 'Truck':
        return <Tag color="cyan">Xe tải</Tag>;
      case 'Van':
        return <Tag color="orange">Xe thùng</Tag>;
      default:
        return <Tag color="gray">{type}</Tag>;
    }
  };

  const columns: ColumnsType<Vehicle> = [
    { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
    { title: 'Biển số xe', dataIndex: 'licensePlate', key: 'licensePlate', align: 'center' },
    { 
      title: 'Loại xe', 
      dataIndex: 'type', 
      key: 'type', 
      align: 'center',
      render: (type) => typeTag(type)
    },
    { 
      title: 'Tải trọng (kg)', 
      dataIndex: 'capacity', 
      key: 'capacity', 
      align: 'center',
      render: (capacity) => `${capacity}`
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      align: 'center', 
      render: (status) => statusTag(status) 
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description', 
      align: 'center',
      render: (desc) => desc || '---'
    },
    { 
      title: 'Ngày tạo', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      align: 'center', 
      render: (date) => dayjs(date).format('YYYY-MM-DD hh:mm:ss') 
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record: Vehicle) => (
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

  const tableData = data.map((vehicle, index) => ({
    ...vehicle,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  return (
    <>
      <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
        Kết quả trả về: {total} phương tiện
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

export default VehicleTable;