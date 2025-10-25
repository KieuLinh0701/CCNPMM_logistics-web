import React, { useEffect, useState } from "react";
import {
  Tabs,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { translateOrderStatus } from "../../../utils/orderUtils";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { getWarehouseImportExportStatsByManager } from "../../../store/orderHistorySlice";
import { OrderHistory } from "../../../types/orderHistory";
import WarehouseSummaryCard from "./components/WarehouseSummaryCard";
import WarehouseTable from "./components/WarehouseTable";
import { getOrderStatuses } from "../../../store/orderSlice";
import { getActiveServiceTypes } from "../../../store/serviceTypeSlice";
import SearchFilters from "./components/SearchFilters";

const { Title } = Typography;
const { TabPane } = Tabs;

const Warehouse: React.FC = () => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterServiceType, setFilterServiceType] = useState<number | string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [sort, setSort] = useState('newest');
  const { warehouse } = useAppSelector((state) => state.orderHistory);
  const { serviceTypes } = useAppSelector((state) => state.serviceType);
  const [hover, setHover] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('1');

  const fetchWarehouse = async (search?: string) => {
    setLoading(true);
    const payload: any = {
      searchText: search ?? searchText,
      serviceType: filterServiceType !== "All" ? filterServiceType : undefined,
      sort: sort !== "newest" ? sort : undefined,
    };
    await dispatch(getWarehouseImportExportStatsByManager(payload));
    setLoading(false);
  };

  const handleFilterChange = (filter: string, value: string | number) => {
    switch (filter) {
      case 'serviceType':
        setFilterServiceType(value);
        break;
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterServiceType('All');
    setSort('newest');
  };

  useEffect(() => {
    dispatch(getOrderStatuses());
    dispatch(getActiveServiceTypes());
  }, [dispatch]);

  useEffect(() => {
    fetchWarehouse();
  }, [searchText, filterServiceType, filterStatus, sort]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <Title level={3} style={{ color: '#1C3D90', margin: 0 }}>
        Thống kê đơn nhập - xuất kho
      </Title>

      <WarehouseSummaryCard
        incomingCount={warehouse?.incomingCount || 0}
        inWarehouseCount={warehouse?.inWarehouseCount || 0}
        exportedCount={warehouse?.exportedCount || 0}
      />

      <SearchFilters
        searchText={searchText}
        filterServiceType={filterServiceType}
        sort={sort}
        hover={hover}
        serviceTypes={serviceTypes || []}
        onSearchChange={setSearchText}
        onFilterChange={handleFilterChange}
        onSortChange={setSort}
        onClearFilters={handleClearFilters}
        onHoverChange={setHover}
      />

      <WarehouseTable
        incomingOrders={warehouse?.incomingOrders || []}
        inWarehouseOrders={warehouse?.inWarehouseOrders || []}
        exportedOrders={warehouse?.exportedOrders || []}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

    </div>
  );
};

export default Warehouse;