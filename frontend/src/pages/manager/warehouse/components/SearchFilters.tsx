import React from 'react';
import { Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { translateVehicleStatus, translateVehicleType } from '../../../../utils/vehicleUtils';
import { serviceType } from '../../../../types/serviceType';

const { Option } = Select;

interface SearchFiltersProps {
  searchText: string;
  filterServiceType: number | string;
  sort: string;
  hover: boolean;
  serviceTypes: serviceType[];
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: string, value: number | string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onHoverChange: (hover: boolean) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchText,
  filterServiceType,
  sort,
  hover,
  serviceTypes,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onClearFilters,
  onHoverChange,
}) => {

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
            value={filterServiceType}
            onChange={(val) => onFilterChange('serviceType', val)}
            style={{ width: 500, height: 36 }}
          >
            <Select.Option value="All">Tất cả dịch vụ</Select.Option>
            {serviceTypes.map((t) => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
          </Select>

          <Select
            value={sort}
            onChange={onSortChange}
            style={{ width: 500, height: 36 }}
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
            <Option value="weightHigh">Trọng lượng cao nhất</Option>
            <Option value="weightLow">Trọng lượng thấp nhất</Option>
          </Select>

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