import React, { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
import Title from "antd/es/typography/Title";
import DateFilter from './components/Filter';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { OrderByDateItem } from '../../../types/order';
import DashboardSummaryCards from './components/DashboardSummaryCards';
import OrderOverview from './components/OrderOverview';
import { getManagerOrdersDashboard } from '../../../store/orderSlice';

const ManagerDashboard: React.FC = () => {
  dayjs.extend(minMax);
  const dispatch = useAppDispatch();
  const { orders = [], statuses = [] } = useAppSelector((state) => state.order);
  const {
    summary,
    statusChart = [],
    ordersByDate = [],
  } = useAppSelector((state) => state.order);

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([dayjs().subtract(7, 'day'), dayjs()]);

  // Nạp lại data khi datarange thay đổi
  useEffect(() => {
    const start = dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined;
    const end = dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined;

    dispatch(getManagerOrdersDashboard({ startDate: start, endDate: end }));
  }, [dateRange]);

  const getGranularity = (start: Dayjs, end: Dayjs) => {
    const diffDays = end.diff(start, 'day');
    if (diffDays <= 30) return 'day';
    if (diffDays <= 180) return 'week';
    if (diffDays <= 730) return 'month';
    return 'year';
  };

  const lineChartOrderData: OrderByDateItem[] = (() => {
    const result: OrderByDateItem[] = [];
    const start = dateRange ? dayjs(dateRange[0]) : ordersByDate[0] ? dayjs(ordersByDate[0].date) : dayjs();
    const end = dateRange ? dayjs(dateRange[1]) : dayjs();
    const granularity = getGranularity(start, end);

    // Map ngày -> count từ API
    const ordersByDateMap: Record<string, number> = {};
    ordersByDate.forEach(item => {
      let date = dayjs(item.date);
      if (granularity === 'week') date = date.startOf('week');
      else if (granularity === 'month') date = date.startOf('month');
      else if (granularity === 'year') date = date.startOf('year');
      else date = date.startOf('day');

      const key = date.format('YYYY-MM-DD');
      ordersByDateMap[key] = (ordersByDateMap[key] || 0) + item.count; // dùng count từ API
    });

    // Fill các ngày trống
    let current = start.clone().startOf(granularity as any);
    const last = end.clone().endOf(granularity as any);

    while (current.isBefore(last) || current.isSame(last, granularity as any)) {
      const key = current.format('YYYY-MM-DD');
      const count = ordersByDateMap[key] || 0;

      let displayDate: string;
      if (granularity === 'year') displayDate = current.format('YYYY');
      else if (granularity === 'month') displayDate = current.format('MM/YYYY');
      else displayDate = current.year() === dayjs().year()
        ? current.format('DD/MM')
        : current.format('DD/MM/YYYY');

      result.push({
        date: current.toDate(),
        displayDate,
        count,
      });

      current = current.add(1, granularity as any);
    }

    return result;
  })();

  return (
    <div style={{ paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: '#1C3D90' }}>Tổng quan</Title>
      </div>

      <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />

      <DashboardSummaryCards
        summary={summary ?? {
          totalOrders: 0,
          completedOrders: 0,
          returnedOrders: 0,
          inTransitOrders: 0,
          totalWeight: 0,
        }}
      />

      {/* Đơn hàng */}
      <OrderOverview
        statusChart={statusChart}
        lineChartData={lineChartOrderData}
      />
    </div >
  );
};

export default ManagerDashboard;