import React, { useState } from "react";
import { Row, Col, Input, Button, Select, } from "antd";
import { CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { translateOrderPayer, translateOrderPaymentMethod } from "../../../../../utils/orderUtils";

type FilterKeys = "payer" | "paymentMethod" | "cod" | "sort";

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  filters: Record<FilterKeys, string>;
  setFilters: (key: FilterKeys, value: string) => void;
  payers: string[];
  paymentMethods: string[];
  onReset: () => void;
}

const { Option } = Select;

const SearchFilters: React.FC<Props> = ({
  searchText,
  setSearchText,
  filters,
  setFilters,
  payers,
  paymentMethods,
  onReset,
}) => {
  const [hover, setHover] = useState(false);
  return (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Input
              style={{ flex: 1, minWidth: 200, height: 36 }}
              placeholder="Tìm theo mã đơn"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />

            <Select
              value={filters.payer}
              onChange={(val) => setFilters("payer", val)}
              style={{ flex: 1, minWidth: 180, height: 36 }}
            >
              <Select.Option value="All">Tất cả người thanh toán</Select.Option>
              {payers.map((p) => <Select.Option key={p} value={p}>{translateOrderPayer(p)}</Select.Option>)}
            </Select>

            <Select
              value={filters.paymentMethod}
              onChange={(val) => setFilters("paymentMethod", val)}
              style={{ flex: 1, minWidth: 250, height: 36 }}
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
              <Select.Option value="none">Không sắp xếp</Select.Option>
              <Option value="codHigh">COD cao nhất</Option>
              <Option value="codLow">COD thấp nhất</Option>
              <Option value="orderValueHigh">Giá trị đơn cao nhất</Option>
              <Option value="orderValueLow">Giá trị đơn thấp nhất</Option>
              <Option value="feeHigh">Phí dịch vụ cao nhất</Option>
              <Option value="feeLow">Phí dịch vụ thấp nhất</Option>
              <Option value="weightHigh">Khối lượng cao nhất</Option>
              <Option value="weightLow">Khối lượng thấp nhất</Option>
            </Select>

            <Select
              value={filters.cod}
              onChange={(val) => setFilters("cod", val)}
              style={{ width: 150, height: 36 }}
            >
              <Select.Option value="All">Tất cả COD</Select.Option>
              <Select.Option value="Yes">Có COD</Select.Option>
              <Select.Option value="No">Không COD</Select.Option>
            </Select>

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