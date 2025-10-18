import dayjs, { Dayjs } from 'dayjs';

interface SoldByDate {
  date: Date;
  total: number;
}

interface ChartData {
  date: string;        // YYYY-MM-DD
  displayDate: string; // dạng hiển thị (DD/MM, MM/YYYY, YYYY)
  total: number;
}

/**
 * Convert soldByDate to chart data with displayDate
 */
export function convertSoldByDateToChartData(
  soldByDate: SoldByDate[],
  startDate?: Dayjs,
  endDate?: Dayjs
): ChartData[] {
  if (!soldByDate || soldByDate.length === 0) return [];

  // 🔹 Xác định granularity dựa vào khoảng thời gian
  const start = startDate || dayjs(soldByDate[0].date);
  const end = endDate || dayjs(soldByDate[soldByDate.length - 1].date);
  const diffDays = end.diff(start, 'day');

  let granularity: 'day' | 'week' | 'month' | 'year' = 'day';
  if (diffDays > 30 && diffDays <= 180) granularity = 'week';
  else if (diffDays > 180 && diffDays <= 730) granularity = 'month';
  else if (diffDays > 730) granularity = 'year';

  // 🔹 Gom nhóm theo granularity
  const grouped: Record<string, number> = {};

  soldByDate.forEach(item => {
    let date = dayjs(item.date);
    if (granularity === 'week') date = date.startOf('week');
    else if (granularity === 'month') date = date.startOf('month');
    else if (granularity === 'year') date = date.startOf('year');
    else date = date.startOf('day');

    const key = date.format('YYYY-MM-DD');
    grouped[key] = (grouped[key] || 0) + item.total;
  });

  // 🔹 Tạo danh sách ngày đầy đủ và định dạng displayDate
  const result: ChartData[] = [];
  let current = start.clone().startOf(granularity as any);
  const last = end.clone().endOf(granularity as any);

  while (current.isBefore(last) || current.isSame(last, granularity as any)) {
    const key = current.format('YYYY-MM-DD');
    const total = grouped[key] || 0;

    // Khởi tạo mặc định
    let displayDate: string = current.format('DD/MM/YYYY');

    if (granularity === 'year') displayDate = current.format('YYYY');
    else if (granularity === 'month') displayDate = current.format('MM/YYYY');
    else if (granularity === 'week' || granularity === 'day') {
      displayDate = current.year() === dayjs().year()
        ? current.format('DD/MM')
        : current.format('DD/MM/YYYY');
    }

    result.push({ date: key, displayDate, total });
    current = current.add(1, granularity as any);
  }

  return result;
}