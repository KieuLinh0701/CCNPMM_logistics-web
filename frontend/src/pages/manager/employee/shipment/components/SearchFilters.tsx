import React, { useState } from "react";
import { Row, Col, Input, Button, Select, DatePicker } from "antd";
import { CloseCircleOutlined, CloseOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { translateShipmentStatus } from "../../../../../utils/shipmentUtils";

type FilterKeys = "sort" | "status";

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  setDateRange: (val: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  filters: Record<FilterKeys, string>;
  setFilters: (key: FilterKeys, value: string) => void;
  onReset: () => void;
  statuses: string[];
}

const { Option } = Select;

const SearchFilters: React.FC<Props> = ({
  searchText,
  setSearchText,
  dateRange,
  setDateRange,
  filters,
  setFilters,
  onReset,
  statuses,
}) => {
  const [hover, setHover] = useState(false);
  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
    width: "100%",
  }}
>
  {/* Sort */}
  <Select
    value={filters.sort}
    onChange={(val) => setFilters("sort", val)}
    style={{ width: 400, height: 36, flexShrink: 0 }}
    dropdownStyle={{ maxHeight: "none", overflowY: "hidden" }}
    listHeight={500}
  >
    <Select.Option value="none">Không sắp xếp</Select.Option>
    <Option value="totalOrdersHigh">Số đơn nhiều nhất</Option>
    <Option value="totalOrdersLow">Số đơn ít nhất</Option>
    <Option value="totalShipmentsHigh">Số chuyến nhiều nhất</Option>
    <Option value="totalShipmentsLow">Số chuyến ít nhất</Option>
    <Option value="completedOrdersHigh">Đơn hoàn thành nhiều nhất</Option>
    <Option value="completedOrdersLow">Đơn hoàn thành ít nhất</Option>
    <Option value="completionRateHigh">Tỉ lệ hoàn thành cao nhất</Option>
    <Option value="completionRateLow">Tỉ lệ hoàn thành thấp nhất</Option>
    <Option value="avgTimePerOrderHigh">Thời gian trung bình/đơn cao nhất</Option>
    <Option value="avgTimePerOrderLow">Thời gian trung bình/đơn thấp nhất</Option>
  </Select>

  {/* Status */}
  <Select
    value={filters.status}
    onChange={(val) => setFilters("status", val)}
    style={{ width: 300, height: 36, flexShrink: 0 }}
    dropdownStyle={{ maxHeight: "none", overflowY: "hidden" }}
    listHeight={400}
  >
    <Select.Option value="All">Tất cả trạng thái</Select.Option>
    {statuses.map((s) => (
      <Select.Option key={s} value={s}>
        {translateShipmentStatus(s)}
      </Select.Option>
    ))}
  </Select>

  {/* DatePicker giãn hết phần còn lại */}
  <div style={{ flex: 1 }}>
    <DatePicker.RangePicker
      style={{ width: "100%", height: 36 }}
      value={dateRange as any}
      onChange={(val) => setDateRange(val as any)}
    />
  </div>

  {/* Nút reset */}
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
      justifyContent: "center",
      flexShrink: 0,
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