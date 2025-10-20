import React, { useState, useEffect } from 'react';
import { DatePicker, Button, Row, Col, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { ClockCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface DateFilterProps {
  dateRange: [Dayjs, Dayjs] | null;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const [now, setNow] = useState(dayjs());
  const [activeQuick, setActiveQuick] = useState<'allTime' | 'today' | '7days' | '30days' | null>('allTime');

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Ban đầu luôn chọn hôm nay
    quickSetDate('allTime');
  }, []);

  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null
  ) => {
    if (dates && dates[0] && dates[1]) {
      onDateRangeChange([dates[0], dates[1]]);
      setActiveQuick(null); // tắt highlight nút khi chọn RangePicker thủ công
    } else {
      onDateRangeChange(null);
    }
  };

  const quickSetDate = (type: 'allTime' | 'today' | '7days' | '30days') => {
    if (type === 'allTime') {
      onDateRangeChange(null);
    } else {
      let start: Dayjs, end: Dayjs;
      if (type === 'today') {
        start = end = dayjs();
      } else if (type === '7days') {
        start = dayjs().subtract(7, 'day');
        end = dayjs();
      } else {
        start = dayjs().subtract(30, 'day');
        end = dayjs();
      }
      onDateRangeChange([start, end]);
    }
    setActiveQuick(type);
  };

  const getButtonStyle = (type: 'allTime' | 'today' | '7days' | '30days') => {
    const isActive = activeQuick === type;
    return {
      backgroundColor: isActive ? '#1C3D90' : '#fff',
      color: isActive ? '#fff' : '#1C3D90',
      borderColor: '#1C3D90',
      fontWeight: 500,
    };
  };

  return (
    <Row gutter={16} align="middle" style={{ marginBottom: 20 }}>
      {/* Bên trái: ngày giờ live */}
      <Col>
        <Space size={8} style={{ backgroundColor: '#fff1f0', padding: '4px 12px', borderRadius: 8 }}>
          <ClockCircleOutlined style={{ color: '#f5222d', fontSize: 16 }} />
          <Text strong style={{ color: '#f5222d', marginRight: 8 }}>LIVE:</Text>
          <Text>{now.format('HH:mm:ss DD/MM/YYYY')}</Text>
        </Space>
      </Col>

      {/* Bên phải: nút nhanh + RangePicker */}
      <Col flex="auto" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button style={getButtonStyle('allTime')} onClick={() => quickSetDate('allTime')}>All Time</Button>
          <Button style={getButtonStyle('today')} onClick={() => quickSetDate('today')}>Hôm nay</Button>
          <Button style={getButtonStyle('7days')} onClick={() => quickSetDate('7days')}>7 ngày trước</Button>
          <Button style={getButtonStyle('30days')} onClick={() => quickSetDate('30days')}>30 ngày trước</Button>

          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{
              borderColor: '#1C3D90',
              borderRadius: 6,
              color: '#1C3D90',
            }}
          />
        </Space>
      </Col>
    </Row>
  );
};

export default DateFilter;