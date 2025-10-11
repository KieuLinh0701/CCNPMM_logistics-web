import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import shipperService, { ShipperOrder } from '../../services/shipperService';

type OrderItem = ShipperOrder;

const UnassignedOrders: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchUnassigned = async (p = page, l = limit) => {
    try {
      setLoading(true);
      const resp = await shipperService.getUnassignedOrders({ page: p, limit: l });
      setData((resp.orders || []) as OrderItem[]);
      setTotal(resp.pagination?.total || 0);
      setPage(resp.pagination?.page || p);
      setLimit(resp.pagination?.limit || l);
    } catch (err) {
      message.error('Lỗi khi tải đơn chưa gán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassigned(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async (orderId: number) => {
    try {
      await shipperService.claimOrder(orderId);
      message.success('Đã nhận đơn');
      fetchUnassigned(page, limit);
    } catch (err: any) {
      message.error(err?.message || 'Lỗi khi nhận đơn');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'blue';
      case 'picked_up': return 'orange';
      case 'in_transit': return 'processing';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'picked_up': return 'Đã lấy hàng';
      case 'in_transit': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const columns: ColumnsType<OrderItem> = [
    { title: 'Mã vận đơn', dataIndex: 'trackingNumber', key: 'trackingNumber' },
    { title: 'Người nhận', dataIndex: 'recipientName', key: 'recipientName' },
    { title: 'SĐT', dataIndex: 'recipientPhone', key: 'recipientPhone' },
    { title: 'Địa chỉ', dataIndex: 'recipientAddress', key: 'recipientAddress', width: 300 },
    { title: 'Dịch vụ', dataIndex: 'serviceType', key: 'serviceType' },
    { title: 'COD', dataIndex: 'codAmount', key: 'codAmount', render: (v: number) => v ? `${v.toLocaleString()}đ` : '—' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag> },
    {
      title: 'Thao tác', key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleClaim(record.id)}>Nhận đơn</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Đơn chưa gán">
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ current: page, pageSize: limit, total, onChange: (p, l) => fetchUnassigned(p, l) }}
        />
      </Card>
    </div>
  );
};

export default UnassignedOrders;


