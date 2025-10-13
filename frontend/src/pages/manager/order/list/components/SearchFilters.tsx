import React from "react";
import { Row, Col, Input, Button, Select, DatePicker } from "antd";
import { CloseCircleOutlined, CloseOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus, translateOrderStatus } from "../../../../../utils/orderUtils";
import { Ward } from "../../../../../types/location";

type FilterKeys = "status" | "payer" | "paymentStatus" | "paymentMethod" | "cod" | "senderWard" | "recipientWard" | "sort";

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  setDateRange: (val: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (val: boolean) => void;
  filters: Record<FilterKeys, string>;
  setFilters: (key: FilterKeys, value: string) => void;
  statuses: string[];
  payers: string[];
  paymentStatuses: string[];
  paymentMethods: string[];
  wards: Ward[]
  onReset: () => void;
}

const { Option } = Select;

const SearchFilters: React.FC<Props> = ({
  searchText,
  setSearchText,
  dateRange,
  setDateRange,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filters,
  setFilters,
  statuses,
  payers,
  paymentStatuses,
  paymentMethods,
  wards,
  onReset,
}) => {
  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Input
              style={{ flex: 1, minWidth: 200, height: 36 }}
              placeholder="Tìm theo mã đơn, tên/số điện thoại người gửi, tên/số điện thoại người nhận"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />

            {/* PHƯỜNG/XÃ NGƯỜI NHẬN */}
            <Select
              value={filters.recipientWard}
              onChange={(val) => setFilters("recipientWard", val)}
              style={{ flex: 1, minWidth: 200, height: 36 }}
            >
              <Select.Option value="All">Tất cả phường/xã người nhận</Select.Option>
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.code}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>

            {/* PHƯỜNG/XÃ NGƯỜI GỬI */}
            <Select
              value={filters.senderWard}
              onChange={(val) => setFilters("senderWard", val)}
              style={{ flex: 1, minWidth: 200, height: 36 }}
            >
              <Select.Option value="All">Tất cả phường/xã người gửi</Select.Option>
              {wards.map((ward) => (
                <Select.Option key={ward.code} value={ward.code}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>

            <DatePicker.RangePicker
              style={{ width: 250, height: 36 }}
              value={dateRange as any}
              onChange={(val) => setDateRange(val as any)}
            />

            <Button
              type="default"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{ height: 36, borderRadius: 8 }}
              icon={showAdvancedFilters ? <CloseOutlined /> : <FilterOutlined />}
            >
              {showAdvancedFilters ? "Ẩn lọc" : "Lọc nâng cao"}
            </Button>

            <Button
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={onReset}
              style={{ height: 36, borderRadius: 8 }}
            >
              Bỏ lọc
            </Button>
          </div>
        </Col>
      </Row>

      {showAdvancedFilters && (
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col span={24}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Select
                value={filters.status}
                onChange={(val) => setFilters("status", val)}
                style={{ flex: 1, minWidth: 180, height: 36 }}
                dropdownStyle={{
                  maxHeight: 'none',
                  overflowY: 'hidden',
                  padding: 0
                }}
                listHeight={statuses.length * 40 + 50}
              >
                <Select.Option value="All">Tất cả trạng thái</Select.Option>
                {statuses.map((s) => <Select.Option key={s} value={s}>{translateOrderStatus(s)}</Select.Option>)}
              </Select>

              <Select
                value={filters.payer}
                onChange={(val) => setFilters("payer", val)}
                style={{ flex: 1, minWidth: 180, height: 36 }}
              >
                <Select.Option value="All">Tất cả người thanh toán</Select.Option>
                {payers.map((p) => <Select.Option key={p} value={p}>{translateOrderPayer(p)}</Select.Option>)}
              </Select>

              <Select
                value={filters.paymentStatus}
                onChange={(val) => setFilters("paymentStatus", val)}
                style={{ flex: 1, minWidth: 180, height: 36 }}
              >
                <Select.Option value="All">Tất cả trạng thái thanh toán</Select.Option>
                {paymentStatuses.map((p) => <Select.Option key={p} value={p}>{translateOrderPaymentStatus(p)}</Select.Option>)}
              </Select>

              <Select
                value={filters.paymentMethod}
                onChange={(val) => setFilters("paymentMethod", val)}
                style={{ flex: 1, minWidth: 180, height: 36 }}
              >
                <Select.Option value="All">Tất cả phương thức thanh toán</Select.Option>
                {paymentMethods.map((p) => <Select.Option key={p} value={p}>{translateOrderPaymentMethod(p)}</Select.Option>)}
              </Select>

              <Select
                value={filters.sort}
                onChange={(val) => setFilters("sort", val)}
                style={{ width: 200, height: 36 }}
                dropdownStyle={{
                  maxHeight: 'none',
                  overflowY: 'hidden'
                }}
                listHeight={400}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="oldest">Cũ nhất</Option>
                <Option value="codHigh">COD cao nhất</Option>
                <Option value="codLow">COD thấp nhất</Option>
                <Option value="orderValueHigh">Giá trị đơn cao nhất</Option>
                <Option value="orderValueLow">Giá trị đơn thấp nhất</Option>
                <Option value="feeHigh">Phí vận chuyển cao nhất</Option>
                <Option value="feeLow">Phí vận chuyển thấp nhất</Option>
                <Option value="weightHigh">Khối lượng cao nhất</Option>
                <Option value="weightLow">Khối lượng thấp nhất</Option>
              </Select>

              <Select
                value={filters.cod}
                onChange={(val) => setFilters("cod", val)}
                style={{ flex: 1, minWidth: 180, height: 36 }}
              >
                <Select.Option value="All">Tất cả COD</Select.Option>
                <Select.Option value="Yes">Có COD</Select.Option>
                <Select.Option value="No">Không COD</Select.Option>
              </Select>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default SearchFilters;