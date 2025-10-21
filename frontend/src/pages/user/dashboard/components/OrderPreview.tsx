import React from 'react';
import { Card, Button, Row, Col, Tooltip, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import {
  FileTextOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import OrderChart from './Chart';
import ProductOverview from './ProductOverview';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;

interface OrderPreviewProps {
  orders: any[];
  statuses: any[];
  dateRange: [Dayjs, Dayjs] | null;
  lineChartData: any[];
}

const groupedStatuses: Record<
  string,
  {
    label: string;
    statuses: string[];
    icon: React.ReactNode;
    description: string;
    color: string;
  }
> = {
  created: {
    label: 'Phát sinh',
    statuses: ['pending', 'confirmed'],
    icon: <ArrowUpOutlined style={{ fontSize: 28, color: '#faad14' }} />,
    description: 'Số lượng đơn hàng đã lên đơn thành công',
    color: '#fff7e6',
  },
  shipping: {
    label: 'Đang giao',
    statuses: ['picked_up', 'in_transit', 'delivering'],
    icon: <TruckOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
    description: 'Số lượng đơn hàng đang được vận chuyển đến người nhận',
    color: '#e6f7ff',
  },
  completed: {
    label: 'Hoàn thành',
    statuses: ['delivered'],
    icon: <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
    description: 'Số lượng đơn hàng đã giao thành công',
    color: '#f6ffed',
  },
  returned: {
    label: 'Hoàn hàng',
    statuses: ['returning', 'returned'],
    icon: <SyncOutlined style={{ fontSize: 28, color: '#f5222d' }} />,
    description: 'Số lượng đơn hàng đã bị hủy',
    color: '#fff1f0',
  },
};

const countOrders = (orders: any[], statuses: string[], dateRange: [Dayjs, Dayjs] | null) => {
  return orders.filter((order) => {
    const createdAt = dayjs(order.createdAt);
    const inRange =
      !dateRange ||
      (createdAt.isAfter(dateRange[0].startOf('day').subtract(1, 'second')) &&
        createdAt.isBefore(dateRange[1].endOf('day').add(1, 'second')));
    return statuses.includes(order.status) && inRange;
  }).length;
};

const OrderPreview: React.FC<OrderPreviewProps> = ({
  orders,
  statuses,
  dateRange,
  lineChartData,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              backgroundColor: 'rgba(28, 61, 144, 0.1)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileTextOutlined style={{ fontSize: 20, color: '#1C3D90' }} />
          </div>
          <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
            Đơn hàng
          </Title>
        </div>

        <Button
          type="primary"
          style={{
            backgroundColor: '#1C3D90',
            borderColor: '#1C3D90',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          onClick={() => navigate('/user/orders')}
        >
          Xem danh sách
          <ArrowRightOutlined />
        </Button>
      </div>

      {/* Nội dung chính */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Cột trái: Các card trạng thái */}
        <div style={{ flex: '0 0 26%' }}>
          <Row gutter={[16, 16]}>
            {Object.keys(groupedStatuses).map((key) => {
              const group = groupedStatuses[key];
              const count = countOrders(orders, group.statuses, dateRange);

              return (
                <Col xs={12} sm={12} md={12} lg={12} key={key}>
                  <Tooltip title={group.description}>
                    <Card
                      bordered={false}
                      hoverable
                      style={{
                        backgroundColor: group.color,
                        height: 120,
                        borderRadius: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Title level={5} style={{ margin: 0 }}>
                        {group.label}
                      </Title>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '12px',
                        }}
                      >
                        <Title level={3} style={{ margin: 0 }}>
                          {count}
                        </Title>
                        {group.icon}
                      </div>
                    </Card>
                  </Tooltip>
                </Col>
              );
            })}
          </Row>
        </div>

        {/* Cột phải: Biểu đồ */}
        <div style={{ flex: 1 }}>
          <OrderChart
            title="Xu hướng đơn hàng"
            data={lineChartData || []}
            keys={['created', 'shipping', 'completed', 'returned']}
            colors={{
              created: '#faad14',
              shipping: '#1890ff',
              completed: '#52c41a',
              returned: '#f5222d',
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default OrderPreview;