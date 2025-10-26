import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, message, Modal, Select, Row, Col, Statistic } from 'antd';
import { CheckOutlined, TruckOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItem {
  id: number;
  trackingNumber: string;
  toOffice?: { id: number; name: string };
  serviceType?: { id: number; name: string };
  createdAt: string;
  weight?: number;
  cod?: number;
}

interface Vehicle {
  id: number;
  licensePlate: string;
  type: string;
  capacity: number;
  status: string;
}

const DriverOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | undefined>(undefined);
  const [pickupLoading, setPickupLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, contextRes] = await Promise.all([
        api.get('/driver/orders/confirmed'),
        api.get('/driver/context')
      ]);
      
      setOrders(Array.isArray((ordersRes.data as any)?.data) ? (ordersRes.data as any).data : []);
      setVehicles(Array.isArray((contextRes.data as any)?.data?.vehicles) ? (contextRes.data as any).data.vehicles : []);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    if (selectedOrders.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận nhận hàng',
      content: `Bạn có chắc chắn muốn nhận ${selectedOrders.length} đơn hàng đã chọn?`,
      onOk: async () => {
        try {
          setPickupLoading(true);
          const res = await api.post('/driver/pickup', {
            vehicleId: selectedVehicle,
            orderIds: selectedOrders
          });
          
          if ((res.data as any)?.success) {
            message.success('Đã nhận hàng thành công');
            setSelectedOrders([]);
            setSelectedVehicle(undefined);
            loadData();
          } else {
            message.error((res.data as any)?.message || 'Nhận hàng thất bại');
          }
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Lỗi khi nhận hàng');
        } finally {
          setPickupLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Đến bưu cục',
      key: 'toOffice',
      render: (record: OrderItem) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.toOffice?.name || '—'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.toOffice?.id || '—'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Dịch vụ',
      key: 'serviceType',
      render: (record: OrderItem) => (
        <Tag color="blue">{record.serviceType?.name || '—'}</Tag>
      ),
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (record: OrderItem) => (
        <Space direction="vertical" size={0}>
          {record.weight && <Text style={{ fontSize: '12px' }}>Cân nặng: {record.weight}kg</Text>}
          {record.cod && record.cod > 0 && (
            <Text style={{ fontSize: '12px', color: '#52c41a' }}>
              COD: {record.cod.toLocaleString()}đ
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedOrders,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedOrders(selectedRowKeys as number[]);
    },
  };

  const stats = {
    total: orders.length,
    selected: selectedOrders.length,
    availableVehicles: vehicles.filter(v => v.status === 'Available').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Đơn hàng cần nhận</Title>
      
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã chọn"
              value={stats.selected}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Xe khả dụng"
              value={stats.availableVehicles}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Bộ lọc và hành động */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Space>
              <Text>Chọn phương tiện:</Text>
              <Select
                placeholder="Chọn xe vận chuyển"
                style={{ width: 200 }}
                value={selectedVehicle}
                onChange={setSelectedVehicle}
                allowClear
              >
                {vehicles
                  .filter(v => v.status === 'Available')
                  .map(vehicle => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.licensePlate} - {vehicle.type} ({vehicle.capacity}kg)
                    </Option>
                  ))}
              </Select>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={loadData} loading={loading}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handlePickup}
                loading={pickupLoading}
                disabled={selectedOrders.length === 0}
              >
                Nhận hàng ({selectedOrders.length})
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
        />
      </Card>
    </div>
  );
};

export default DriverOrders;
