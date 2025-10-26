import React, { useState } from 'react';
import { Card } from 'antd';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip, Legend } from 'recharts';
import { OrderByDateItem, StatusChartItem } from '../../../../types/order';
import Title from 'antd/es/typography/Title';
import Chart from './Chart';
import { translateOrderStatus } from '../../../../utils/orderUtils';

const COLORS = [
  '#fadb14', // Chờ xác nhận (vàng tươi)
  '#40a9ff', // Đang giao hàng (xanh da trời)
  '#ff4d4f', // Đang hoàn (đỏ)
  '#36cfc9', // Đang vận chuyển (xanh lơ)
  '#73d13d', // Đã giao hàng (xanh lá)
  '#9254de', // Đã hoàn (tím)
  '#595959', // Đã lấy hàng (xám đậm)
  '#fa8c16', // Đã xác nhận (cam)
];

interface OrderOverviewProps {
  statusChart: StatusChartItem[];
  lineChartData: OrderByDateItem[];
}

const OrderOverview: React.FC<OrderOverviewProps> = ({ statusChart, lineChartData }) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: 16,
        marginTop: 24,
      }}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Bên trái: Pie chart */}
        <div style={{ flex: '0 0 40%' }}>
          <Card bordered={false}>
            <Title level={5} style={{ color: '#1C3D90' }}>Tỷ lệ trạng thái đơn hàng</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChart.map(item => ({ ...item, label: translateOrderStatus(item.label) }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="label"
                  label
                  stroke="none"
                  isAnimationActive={false}
                >
                  {statusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bên phải: Line chart */}
        <div style={{ flex: '1 1 60%' }}>
          <Card bordered={false}>
            <Chart
              title="Số lượng đơn hàng phát sinh theo thời gian"
              data={lineChartData}
              keys={['count']}
              colors={{ count: '#1C3D90' }}
            />
          </Card>
        </div>
      </div>
    </Card>
  );
};

export default OrderOverview;