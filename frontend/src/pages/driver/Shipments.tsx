import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, message, Modal, Row, Col, Statistic, Descriptions } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

interface ShipmentItem {
  id: number;
  status: 'Pending' | 'InTransit' | 'Completed' | 'Cancelled';
  startTime?: string;
  endTime?: string;
  vehicleId?: number;
  vehicle?: {
    id: number;
    licensePlate: string;
    type: string;
  };
  orders?: Array<{
    id: number;
    trackingNumber: string;
    toOffice?: { name: string };
  }>;
  orderCount?: number;
}

const DriverShipments: React.FC = () => {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/shipments');
      const data = (res.data as any)?.data || [];
      setShipments(data);
    } catch (error) {
      message.error('Lỗi khi tải danh sách chuyến vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const handleStartShipment = async (shipmentId: number) => {
    Modal.confirm({
      title: 'Bắt đầu vận chuyển',
      content: 'Bạn có chắc chắn muốn bắt đầu chuyến vận chuyển này?',
      onOk: async () => {
        try {
          setActionLoading(shipmentId);
          const res = await api.post('/driver/shipment/start', { shipmentId });
          
          if ((res.data as any)?.success) {
            message.success('Đã bắt đầu vận chuyển');
            loadShipments();
          } else {
            message.error((res.data as any)?.message || 'Bắt đầu vận chuyển thất bại');
          }
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Lỗi khi bắt đầu vận chuyển');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleFinishShipment = async (shipmentId: number, status: 'Completed' | 'Cancelled') => {
    const actionText = status === 'Completed' ? 'hoàn thành' : 'hủy';
    Modal.confirm({
      title: `${status === 'Completed' ? 'Hoàn thành' : 'Hủy'} chuyến vận chuyển`,
      content: `Bạn có chắc chắn muốn ${actionText} chuyến vận chuyển này?`,
      okText: status === 'Completed' ? 'Hoàn thành' : 'Hủy',
      okButtonProps: { danger: status === 'Cancelled' },
      onOk: async () => {
        try {
          setActionLoading(shipmentId);
          const res = await api.post('/driver/shipment/finish', { shipmentId, status });
          
          if ((res.data as any)?.success) {
            message.success(`Đã ${actionText} chuyến vận chuyển`);
            loadShipments();
          } else {
            message.error((res.data as any)?.message || `${actionText} chuyến vận chuyển thất bại`);
          }
        } catch (error: any) {
          message.error(error?.response?.data?.message || `Lỗi khi ${actionText} chuyến vận chuyển`);
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'InTransit': return 'blue';
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ bắt đầu';
      case 'InTransit': return 'Đang vận chuyển';
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'ID Chuyến',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      width: 150,
      render: (record: ShipmentItem) => (
        record.vehicle ? (
          <Space direction="vertical" size={0}>
            <Text strong>{record.vehicle.licensePlate}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.vehicle.type}</Text>
          </Space>
        ) : '—'
      ),
    },
    {
      title: 'Số đơn hàng',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (count: number) => <Text strong>{count || 0}</Text>,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => time ? new Date(time).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (time: string) => time ? new Date(time).toLocaleString('vi-VN') : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (record: ShipmentItem) => (
        <Space>
          {record.status === 'Pending' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStartShipment(record.id)}
              loading={actionLoading === record.id}
            >
              Bắt đầu
            </Button>
          )}
          {record.status === 'InTransit' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleFinishShipment(record.id, 'Completed')}
                loading={actionLoading === record.id}
              >
                Hoàn thành
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleFinishShipment(record.id, 'Cancelled')}
                loading={actionLoading === record.id}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'Pending').length,
    inTransit: shipments.filter(s => s.status === 'InTransit').length,
    completed: shipments.filter(s => s.status === 'Completed').length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý chuyến vận chuyển</Title>
      
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chuyến"
              value={stats.total}
              prefix={<TruckOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ bắt đầu"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang vận chuyển"
              value={stats.inTransit}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={shipments}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chuyến`,
          }}
          expandable={{
            expandedRowRender: (record: ShipmentItem) => (
              <div style={{ margin: 0 }}>
                <Title level={5}>Chi tiết đơn hàng trong chuyến</Title>
                {record.orders && record.orders.length > 0 ? (
                  <Descriptions size="small" column={2}>
                    {record.orders.map((order, index) => (
                      <Descriptions.Item key={order.id} label={`Đơn ${index + 1}`}>
                        <Space direction="vertical" size={0}>
                          <Text strong>{order.trackingNumber}</Text>
                          <Text type="secondary">{order.toOffice?.name || '—'}</Text>
                        </Space>
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <Text type="secondary">Không có đơn hàng</Text>
                )}
              </div>
            ),
            rowExpandable: (record: ShipmentItem) => !!(record.orders && record.orders.length > 0),
          }}
        />
      </Card>
    </div>
  );
};

export default DriverShipments;
