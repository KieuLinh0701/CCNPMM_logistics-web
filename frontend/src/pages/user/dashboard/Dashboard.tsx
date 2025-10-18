import React, { useEffect, useState } from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import Title from "antd/es/typography/Title";
import DateFilter from './components/Filter';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { getOrderStatuses, getUserOrdersDashboard } from '../../../store/orderSlice';
import ProductOverview from './components/ProductOverview';
import OrderPreview from './components/OrderPreview';
import { convertSoldByDateToChartData } from '../../../utils/chartUtils';
import { getUserProductsDashboard } from '../../../store/productSlice';

const UserDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders = [], statuses = [] } = useAppSelector((state) => state.order);
  const {
    outOfStockProducts,
    activeProducts,
    productByType,
    inactiveProducts,
    soldByDate,
    topSelling,
    topReturned,
  } = useAppSelector((state) => state.product);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([dayjs().subtract(7, 'day'), dayjs()]);

  // Nạp lại data khi datarange thay đổi
  useEffect(() => {
    if (!dateRange) return;
    dispatch(getUserOrdersDashboard({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    }));

    dispatch(getUserProductsDashboard({
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    }));
  }, [dateRange]);

  const getGranularity = (start: Dayjs, end: Dayjs) => {
    const diffDays = end.diff(start, 'day');
    if (diffDays <= 30) return 'day';
    if (diffDays <= 180) return 'week';
    if (diffDays <= 730) return 'month';
    return 'year';
  };

  const lineChartOrderData = (() => {
    const result: any[] = [];
    const start = dateRange ? dateRange[0] : (orders[0] ? dayjs(orders[0].createdAt) : dayjs());
    const end = dateRange ? dateRange[1] : dayjs();
    const granularity = getGranularity(start, end);

    const grouped: Record<string, any> = {};

    const groupedStatusesKeys = {
      created: ['pending', 'confirmed'],
      shipping: ['picked_up', 'in_transit', 'delivering'],
      completed: ['delivered'],
      returned: ['returning', 'returned']
    };

    // Group orders
    orders.forEach(order => {
      let date = dayjs(order.createdAt);
      if (granularity === 'week') date = date.startOf('week');
      else if (granularity === 'month') date = date.startOf('month');
      else if (granularity === 'year') date = date.startOf('year');
      else date = date.startOf('day');

      const key = date.format('YYYY-MM-DD');
      if (!grouped[key]) grouped[key] = { date: key, created: 0, shipping: 0, completed: 0, returned: 0 };

      if (groupedStatusesKeys.created.includes(order.status)) grouped[key].created += 1;
      else if (groupedStatusesKeys.shipping.includes(order.status)) grouped[key].shipping += 1;
      else if (groupedStatusesKeys.completed.includes(order.status)) grouped[key].completed += 1;
      else if (groupedStatusesKeys.returned.includes(order.status)) grouped[key].returned += 1;
    });

    // Fill all dates in range
    let current = start.clone().startOf(granularity as any);
    const last = end.clone().endOf(granularity as any);

    while (current.isBefore(last) || current.isSame(last, granularity as any)) {
      const key = current.format('YYYY-MM-DD');
      if (!grouped[key]) grouped[key] = { date: key, created: 0, shipping: 0, completed: 0, returned: 0 };

      // displayDate
      if (granularity === 'year') grouped[key].displayDate = current.format('YYYY');
      else if (granularity === 'month') grouped[key].displayDate = current.format('MM/YYYY');
      else if (granularity === 'week' || granularity === 'day') {
        grouped[key].displayDate = current.year() === dayjs().year()
          ? current.format('DD/MM')
          : current.format('DD/MM/YYYY');
      }

      result.push(grouped[key]);
      current = current.add(1, granularity as any);
    }

    const todayKey = dayjs().format('YYYY-MM-DD');
    if (!grouped[todayKey]) {
      result.push({
        date: todayKey,
        displayDate: dayjs().format('DD/MM/YYYY'),
        created: 0,
        shipping: 0,
        completed: 0,
        returned: 0
      });
    }

    return result;
  })();

  const lineChartProductData = (() => {
    const result: any[] = [];
    const data = soldByDate || []; 
    const start = dateRange ? dateRange[0] : (data[0] ? dayjs(data[0].date) : dayjs());
    const end = dateRange ? dateRange[1] : dayjs();

    // Xác định granularity dựa vào khoảng thời gian
    const diffDays = end.diff(start, 'day');
    let granularity: 'day' | 'week' | 'month' | 'year' = 'day';
    if (diffDays > 30 && diffDays <= 180) granularity = 'week';
    else if (diffDays > 180 && diffDays <= 730) granularity = 'month';
    else if (diffDays > 730) granularity = 'year';

    // Gom dữ liệu theo granularity
    const grouped: Record<string, number> = {};
    data.forEach(item => {  
      let date = dayjs(item.date);
      if (granularity === 'week') date = date.startOf('week');
      else if (granularity === 'month') date = date.startOf('month');
      else if (granularity === 'year') date = date.startOf('year');
      else date = date.startOf('day');

      const key = date.format('YYYY-MM-DD');
      grouped[key] = (grouped[key] || 0) + item.total;
    });

    // Fill tất cả các ngày trong range, tạo displayDate
    let current = start.clone().startOf(granularity as any);
    const last = end.clone().endOf(granularity as any);

    while (current.isBefore(last) || current.isSame(last, granularity as any)) {
      const key = current.format('YYYY-MM-DD');
      const total = grouped[key] || 0;

      // Tạo displayDate
      let displayDate: string;
      if (granularity === 'year') displayDate = current.format('YYYY');
      else if (granularity === 'month') displayDate = current.format('MM/YYYY');
      else displayDate = current.year() === dayjs().year()
        ? current.format('DD/MM')
        : current.format('DD/MM/YYYY');

      result.push({ date: key, displayDate, total });
      current = current.add(1, granularity as any);
    }

    return result;
  })();

  useEffect(() => { dispatch(getOrderStatuses()); }, [dispatch]);

  return (
    <div style={{ paddingBottom: 24, paddingLeft: 24, paddingRight: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1C3D90' }}>Tổng quan</Title>
      </div>

      <DateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
      {/* Đơn hàng */}
      <OrderPreview
        orders={orders}
        statuses={statuses}
        dateRange={dateRange}
        lineChartData={lineChartOrderData}
      />

      {/* Sản phẩm */}
      <ProductOverview
        totalProducts={(activeProducts || 0) + (inactiveProducts || 0)}
        activeProducts={activeProducts || 0}
        inactiveProducts={inactiveProducts || 0}
        outOfStockProducts={outOfStockProducts || 0}
        soldByDate={lineChartProductData}
        productByType={productByType || []}
        topSelling={topSelling || []}
        topReturned={topReturned || []}
      />
    </div >
  );
};

export default UserDashboard;