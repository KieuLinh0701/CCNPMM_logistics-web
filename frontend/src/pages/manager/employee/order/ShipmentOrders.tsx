import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tag, Row } from "antd";
import {
  getOrderStatuses,
  getOrderPayers,
  getOrderPaymentMethods,
  getShipmentOrders,
} from "../../../../store/orderSlice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import SearchFilters from "./components/SearchFilters";
import OrderTable from "./components/Table";
import Actions from "./components/Actions";

const ShipmentOrder = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { employeeId } = useParams<{ employeeId: string }>();
  const empId = Number(employeeId);

  const { shipmentId } = useParams<{ shipmentId: string }>();
  const shipId = Number(shipmentId);

  const { user } = useAppSelector(state => state.auth);
  const { orders = [], total = 0, paymentMethods = [], payers = [] } = useAppSelector((state) => state.order);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterSort, setFilterSort] = useState("none");
  const [filterPayer, setFilterPayer] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterCOD, setFilterCOD] = useState("All");

  // --- Fetch Orders ---
  const fetchOrders = (page = currentPage, search?: string) => {

    const payload: any = {
      shipmentId: shipId,
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      payer: filterPayer !== "All" ? filterPayer : undefined,
      paymentMethod: filterPayment !== "All" ? filterPayment : undefined,
      cod: filterCOD !== "All" ? filterCOD : undefined,
      sort: filterSort !== "none" ? filterSort : undefined,
    };
    dispatch(getShipmentOrders(payload));
  };

  const handleViewOrderDetail = (trackingNumber: string) => {
    navigate(`/manager/orders/detail/${trackingNumber}`);
  };


  useEffect(() => {
    dispatch(getOrderPaymentMethods());
    dispatch(getOrderStatuses());
    dispatch(getOrderPayers());
    fetchOrders();
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
  }, [searchText, filterPayment, filterPayer, filterCOD, filterSort]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        filters={{ payer: filterPayer, paymentMethod: filterPayment, cod: filterCOD, sort: filterSort }}
        setFilters={(key, val) => {
          if (key === "payer") setFilterPayer(val);
          if (key === "paymentMethod") setFilterPayment(val);
          if (key === "cod") setFilterCOD(val);
          if (key === "sort") setFilterSort(val);
        }}
        payers={payers}
        paymentMethods={paymentMethods}
        onReset={() => {
          setSearchText("");
          setFilterPayment("All");
          setFilterSort("none");
          setFilterPayer("All");
          setFilterCOD("All");
          setCurrentPage(1);
        }}
      />

      <Row justify="start">
        <Actions
          employeeId={empId}
        />
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} đơn hàng</Tag>

      <OrderTable
        orders={orders}
        role={user?.role}
        onDetail={handleViewOrderDetail}
      />
    </div>
  );
};

export default ShipmentOrder;