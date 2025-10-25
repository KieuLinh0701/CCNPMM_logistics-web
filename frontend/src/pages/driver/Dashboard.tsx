import React, { useEffect, useState } from 'react';
import { Card, Row, Col, List, Tag, Button, Space, Typography, message, Table, Select } from 'antd';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

interface OfficeInfo { id: number; name: string; address: string; }
interface Vehicle { id: number; licensePlate: string; type: string; capacity: number; status: string; }
interface OrderItem { id: number; trackingNumber: string; toOffice?: { id: number; name: string }; serviceType?: { id: number; name: string }; }

const DriverDashboard: React.FC = () => {
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicleId, setVehicleId] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadContext();
    loadOrders();
  }, []);

  const loadContext = async () => {
    try {
      const res = await api.get('/driver/context');
      const data = (res.data as any)?.data || {};
      setOffice(data.office || null);
      setVehicles(Array.isArray(data.vehicles) ? data.vehicles : []);
    } catch (e) {
      message.error('Không tải được thông tin driver');
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/orders/confirmed');
      setOrders(Array.isArray((res.data as any)?.data) ? (res.data as any).data : []);
    } catch (e) {
      message.error('Không tải được danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async () => {
    try {
      if (!orders.length) return message.info('Không có đơn để nhận');
      const orderIds = orders.map(o => o.id);
      const res = await api.post('/driver/pickup', { vehicleId, orderIds });
      if ((res.data as any)?.success) {
        message.success('Đã nhận hàng, tạo chuyến Pending');
        loadOrders();
      } else {
        message.error((res.data as any)?.message || 'Nhận hàng thất bại');
      }
    } catch (e: any) {
      message.error(e?.message || 'Lỗi nhận hàng');
    }
  };

  const columns = [
    { title: 'Mã đơn', dataIndex: 'trackingNumber', key: 'trackingNumber' },
    { title: 'Đến bưu cục', key: 'toOffice', render: (r: OrderItem) => r.toOffice?.name || '-' },
    { title: 'Dịch vụ', key: 'serviceType', render: (r: OrderItem) => r.serviceType?.name || '-' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Driver Dashboard</Title>

      <Row gutter={16}>
        <Col span={10}>
          <Card title="Văn phòng làm việc">
            {office ? (
              <Space direction="vertical">
                <Text strong>{office.name}</Text>
                <Text type="secondary">{office.address}</Text>
              </Space>
            ) : (
              <Text>—</Text>
            )}
          </Card>

          <Card title="Phương tiện tại văn phòng" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                allowClear
                placeholder="Chọn phương tiện cho chuyến đi"
                style={{ width: '100%' }}
                value={vehicleId}
                onChange={(v) => setVehicleId(v)}
              >
                {vehicles.map(v => (
                  <Option key={v.id} value={v.id}>
                    {v.licensePlate} - {v.type} - {v.capacity}kg
                  </Option>
                ))}
              </Select>
              <List
                dataSource={vehicles}
                renderItem={(v) => (
                  <List.Item>
                    <Space>
                      <Text strong>{v.licensePlate}</Text>
                      <Tag>{v.type}</Tag>
                      <Tag color="blue">{v.capacity}kg</Tag>
                      <Tag color={v.status === 'Available' ? 'green' : 'orange'}>{v.status}</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Space>
          </Card>
        </Col>
        <Col span={14}>
          <Card title="Đơn cần nhận (Confirmed)" extra={<Button onClick={loadOrders}>Tải lại</Button>}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={orders}
              loading={loading}
              pagination={false}
            />
            <div style={{ marginTop: 12 }}>
              <Button type="primary" onClick={handlePickup} disabled={!orders.length}>Xác nhận nhận hàng</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DriverDashboard;