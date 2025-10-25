import React, { useState } from "react";
import { Row, Col, Input, Button, Select, DatePicker } from "antd";
import { CloseCircleOutlined, CloseOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { translateTransactionStatus, translateTransactionType } from "../../../../../utils/transactionUtils";

type FilterKeys = "type" | "sort" | "status";

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  setDateRange: (val: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  filters: Record<FilterKeys, string>;
  setFilters: (key: FilterKeys, value: string) => void;
  types: string[];
  statuses: string[];
  onReset: () => void;
}

const { Option } = Select;

const SearchFilters: React.FC<Props> = ({
  searchText,
  setSearchText,
  dateRange,
  setDateRange,
  filters,
  setFilters,
  types,
  statuses,
  onReset,
}) => {
  const [hover, setHover] = useState(false);
  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Input
              style={{ flex: 1, height: 36 }}
              placeholder="Tìm theo mã giao dịch, mã lịch sử đối soát, mã đơn hàng, tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
            <Select
              value={filters.sort}
              onChange={(val) => setFilters("sort", val)}
              style={{ width: 150, height: 36 }}
              dropdownStyle={{
                maxHeight: 'none',
                overflowY: 'hidden'
              }}
              listHeight={400}
            >
              <Option value="newest">Mới nhất</Option>
              <Option value="oldest">Cũ nhất</Option>
              <Option value="amountHigh">Giá trị cao nhất</Option>
              <Option value="amountLow">Giá trị thấp nhất</Option>
            </Select>

            <Select
              value={filters.type}
              onChange={(val) => setFilters("type", val)}
              style={{ width: 150, height: 36 }}
              dropdownStyle={{
                maxHeight: 'none',
                overflowY: 'hidden',
                padding: 0
              }}
              listHeight={types.length * 40 + 50}
            >
              <Select.Option value="All">Tất cả giao dịch</Select.Option>
              {types.map((t) => <Select.Option key={t} value={t}>{translateTransactionType(t)}</Select.Option>)}
            </Select>

            <Select
              value={filters.status}
              onChange={(val) => setFilters("status", val)}
              style={{ width: 150, height: 36 }}
              dropdownStyle={{
                maxHeight: 'none',
                overflowY: 'hidden',
                padding: 0
              }}
              listHeight={types.length * 40 + 50}
            >
              <Select.Option value="All">Tất cả trạng thái</Select.Option>
              {statuses.map((t) => <Select.Option key={t} value={t}>{translateTransactionStatus(t)}</Select.Option>)}
            </Select>

            <DatePicker.RangePicker
              style={{ minWidth: 250, height: 36 }}
              value={dateRange as any}
              onChange={(val) => setDateRange(val as any)}
            />
            <Button
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={onReset}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "width 0.2s",
                width: hover ? 110 : 36,
                justifyContent: hover ? "center" : "center",
              }}
            >
              {hover && "Bỏ lọc"}
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default SearchFilters;