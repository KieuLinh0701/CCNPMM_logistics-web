import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, Row, Col, Statistic, DatePicker, Select, Button, Space, Descriptions } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, TruckOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import { message } from 'antd';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface HistoryItem {
  id: number;
  status: 'Completed' | 'Cancelled';
  startTime: string;
  endTime: string;
  vehicleId?: number;
  vehicle?: {
    licensePlate: string;
    type: string;
  };
  orders: Array<{
    id: number;
    trackingNumber: string;
    toOffice: { name: string };
  }>;
  orderCount: number;
  duration: number; // in hours
}

const DriverHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    dateRange: undefined as [dayjs.Dayjs, dayjs.Dayjs] | undefined,
  });

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.dateRange) {
        params.dateFrom = filters.dateRange[0].format('YYYY-MM-DD');
        params.dateTo = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const res = await api.get('/driver/history', { params });
      const data = (res.data as any)?.data || [];
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      message.error('Lỗi khi tải lịch sử vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed': return 'Hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircleOutlined />;
      case 'Cancelled': return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
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
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Phương tiện',
      key: 'vehicle',
      width: 150,
      render: (record: HistoryItem) => (
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
      render: (count: number) => <Text strong>{count}</Text>,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thời gian vận chuyển',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: number) => `${duration}h`,
    },
  ];

  const stats = {
    total: history.length,
    completed: history.filter(h => h.status === 'Completed').length,
    cancelled: history.filter(h => h.status === 'Cancelled').length,
    totalOrders: history.reduce((sum, h) => sum + h.orderCount, 0),
    totalDuration: history.reduce((sum, h) => sum + h.duration, 0),
  };

  const resetFilters = () => {
    setFilters({ status: undefined, dateRange: undefined });
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Lịch sử vận chuyển</Title>
      
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
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Bộ lọc */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Option value="Completed">Hoàn thành</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] }))}
            />
          </Col>
          <Col span={4}>
            <Button onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={history}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chuyến`,
          }}
          expandable={{
            expandedRowRender: (record: HistoryItem) => (
              <div style={{ margin: 0 }}>
                <Title level={5}>Chi tiết đơn hàng trong chuyến</Title>
                <Descriptions size="small" column={2}>
                  {record.orders.map((order, index) => (
                    <Descriptions.Item key={order.id} label={`Đơn ${index + 1}`}>
                      <Space direction="vertical" size={0}>
                        <Text strong>{order.trackingNumber}</Text>
                        <Text type="secondary">{order.toOffice.name}</Text>
                      </Space>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              </div>
            ),
            rowExpandable: (record: HistoryItem) => record.orders.length > 0,
          }}
        />
      </Card>
    </div>
  );
};

export default DriverHistory;
