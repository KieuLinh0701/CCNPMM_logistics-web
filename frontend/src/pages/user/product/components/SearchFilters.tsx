import React from 'react';
import { Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface SearchFiltersProps {
  searchText: string;
  filterType: string;
  filterStatus: string;
  stockFilter: string;
  sort: string;
  dateRange: [Dayjs, Dayjs] | null;
  hover: boolean;
  types: string[];
  statuses: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onSortChange: (value: string) => void;
  // ✅ FIX: Sửa type cho onDateRangeChange
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onClearFilters: () => void;
  onHoverChange: (hover: boolean) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchText,
  filterType,
  filterStatus,
  stockFilter,
  sort,
  dateRange,
  hover,
  types,
  statuses,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onDateRangeChange,
  onClearFilters,
  onHoverChange,
}) => {
  
  const handleDateRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null, 
    dateStrings: [string, string]
  ) => {
    // Chuyển đổi từ [Dayjs | null, Dayjs | null] sang [Dayjs, Dayjs] | null
    if (dates && dates[0] && dates[1]) {
      onDateRangeChange([dates[0], dates[1]]);
    } else {
      onDateRangeChange(null);
    }
  };

  return (
    <Row gutter={16} style={{ marginBottom: 40 }}>
      <Col span={24}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            placeholder="Tìm theo tên sản phẩm"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
          
          <Select 
            value={filterType} 
            onChange={(val) => onFilterChange('type', val)} 
            style={{ width: 150, height: 36 }}
          >
            <Option value="All">Tất cả loại</Option>
            {types.map((t) => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>

          <Select 
            value={filterStatus} 
            onChange={(val) => onFilterChange('status', val)} 
            style={{ width: 150, height: 36 }}
          >
            <Option value="All">Tất cả trạng thái</Option>
            {statuses.map((s) => (
              <Option key={s} value={s}>{s}</Option>
            ))}
          </Select>

          <Select 
            value={stockFilter} 
            onChange={(val) => onFilterChange('stock', val)} 
            style={{ width: 150, height: 36 }}
          >
            <Option value="All">Tất cả tồn kho</Option>
            <Option value="inStock">Còn hàng</Option>
            <Option value="outOfStock">Hết hàng</Option>
            <Option value="lowStock">Sắp hết hàng</Option>
          </Select>

          <Select
            value={sort}
            onChange={onSortChange}
            style={{ width: 180, height: 36 }}
          >
            <Option value="none">Không sắp xếp</Option>
            <Option value="bestSelling">Bán chạy nhất</Option>
            <Option value="leastSelling">Bán ít nhất</Option>
            <Option value="highestPrice">Giá cao nhất</Option>
            <Option value="lowestPrice">Giá thấp nhất</Option>
            <Option value="highestStock">Tồn kho nhiều nhất</Option>
            <Option value="lowestStock">Tồn kho ít nhất</Option>
          </Select>

          <RangePicker 
            style={{ width: 850, height: 36 }} 
            value={dateRange}
            onChange={handleDateRangeChange} 
          />
          
          <Button
            type="default"
            icon={<CloseCircleOutlined />}
            onClick={onClearFilters}
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            style={{
              height: 36,
              borderRadius: 8,
              transition: 'width 0.2s',
              width: hover ? 110 : 100,
            }}
          >
            {hover && 'Bỏ lọc'}
          </Button>
        </div>
      </Col>
    </Row>
  );
};

export default SearchFilters;