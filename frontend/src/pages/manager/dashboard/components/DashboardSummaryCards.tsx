import React from 'react';
import { Card, Tooltip, Typography } from 'antd';
import Title from 'antd/es/typography/Title';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  TruckOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { DashboardSummary } from '../../../../types/order';

const { Text } = Typography;

interface Props {
  summary: DashboardSummary;
}

const DashboardSummaryCards: React.FC<Props> = ({ summary }) => {
  const cards = [
    {
      label: 'Tổng đơn',
      value: summary.totalOrders,
      icon: <FileTextOutlined style={{ fontSize: 35, color: '#1C3D90' }} />,
      color: '#e6f7ff',
      tooltip: 'Tổng số đơn hàng thuộc bưu cục',
    },
    {
      label: 'Đã hoàn thành',
      value: summary.completedOrders,
      icon: <CheckCircleOutlined style={{ fontSize: 35, color: '#52c41a' }} />,
      color: '#f6ffed',
      tooltip: 'Số đơn hàng đã giao thành công',
    },
    {
      label: 'Đang vận chuyển',
      value: summary.inTransitOrders,
      icon: <TruckOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
      color: '#e6f7ff',
      tooltip: 'Số đơn hàng đang vận chuyển',
    },
    {
      label: 'Đã hoàn',
      value: summary.returnedOrders,
      icon: <SyncOutlined style={{ fontSize: 35, color: '#f5222d' }} />,
      color: '#fff1f0',
      tooltip: 'Số đơn hàng đã hoàn',
    },
    {
      label: 'Tổng trọng lượng',
      value: summary.totalWeight,
      icon: <ArrowUpOutlined style={{ fontSize: 35, color: '#faad14' }} />,
      color: '#fff7e6',
      tooltip: 'Tổng trọng lượng hàng hóa',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {cards.map((card) => (
        <Tooltip title={card.tooltip} key={card.label} style={{ flex: 1 }}>
          <Card
            bordered={false}
            hoverable
            style={{
              backgroundColor: card.color,
              height: 120,
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              {card.label}
            </Title>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
              }}
            >
              <Title level={2} style={{ margin: 0 }}>
                {card.value}
              </Title>
              <div style={{ marginTop: -10 }}>{card.icon}</div>
            </div>
          </Card>
        </Tooltip>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;