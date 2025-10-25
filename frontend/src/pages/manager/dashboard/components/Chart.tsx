import React from 'react';
import { Card } from 'antd';
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartProps {
  title: string;
  data: any[];
  keys: string[];
  colors: Record<string, string>;
}

const Chart: React.FC<ChartProps> = ({ title, data, keys, colors }) => {
  const labels: Record<string, string> = {
    created: 'Phát sinh',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    returned: 'Hoàn hàng',
    total: 'Tổng',
  };

  return (
    <Card title={title}
      headStyle={{ color: '#1C3D90', fontWeight: 600 }}>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="displayDate"
            tickFormatter={(date: string) => date}
          />
          <YAxis
            label={{
              value: 'Số đơn',
              angle: -90,
              position: 'insideLeft',
              style: { fontWeight: 500, fill: '#555' }
            }}
            allowDecimals={false}
          />
          <Tooltip />
          <Legend formatter={(value) => labels[value] || value} />
          {keys.map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[key]}
              activeDot={{ r: 6 }}
              connectNulls={true}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default Chart;