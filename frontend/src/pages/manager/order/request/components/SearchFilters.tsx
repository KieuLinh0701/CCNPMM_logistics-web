import React from 'react';
import { Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { translateRequestType, translateStatus } from '../../../../../utils/shippingRequestUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface SearchFiltersProps {
  searchText: string;
  filterRrequestType: string;
  filterStatus: string;
  sort: string;
  dateRange: [Dayjs, Dayjs] | null;
  hover: boolean;
  requestTypes: string[];
  statuses: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onSortChange: (value: string) => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs] | null) => void;
  onClearFilters: () => void;
  onHoverChange: (hover: boolean) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchText,
  filterRrequestType,
  filterStatus,
  sort,
  dateRange,
  hover,
  requestTypes,
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
            placeholder="Tìm theo mã đơn hàng"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
          
          <Select 
            value={filterRrequestType} 
            onChange={(val) => onFilterChange('requestType', val)} 
            style={{ width:500, height: 36 }}
          >
            <Option value="All">Tất cả yêu cầu</Option>
            {requestTypes.map((t) => (
              <Option key={t} value={t}>{translateRequestType(t)}</Option>
            ))}
          </Select>

          <Select 
            value={filterStatus} 
            onChange={(val) => onFilterChange('status', val)} 
            style={{ width: 500, height: 36 }}
          >
            <Option value="All">Tất cả trạng thái</Option>
            {statuses.map((s) => (
              <Option key={s} value={s}>{translateStatus(s)}</Option>
            ))}
          </Select>

          <Select
            value={sort}
            onChange={onSortChange}
            style={{ width: 500, height: 36 }}
          >
            <Option value="newest">Mới nhất xếp trước</Option>
            <Option value="oldest">Cũ nhất xếp trước</Option>
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