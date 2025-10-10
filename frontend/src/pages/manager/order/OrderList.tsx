import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Tag, Row, Col } from "antd";
import dayjs from "dayjs";
import {
  getStatusesEnum,
  getPayersEnum,
  getPaymentMethodsEnum,
  getPaymentStatusesEnum,
  getOrdersByOffice,
} from "../../../store/orderSlice";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import SearchFilters from "./components/SearchFilters";
import OrderTable from "./components/Table";
import OrderActions from "./components/Actions";
import { City, Ward } from "../../../types/location";
import { getByUserId } from "../../../store/officeSlice";

const OrderListManager = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { office, loading } = useAppSelector(state => state.office);
  const { orders = [], total = 0, paymentMethods = [], statuses = [], payers = [], paymentStatuses = [] } = useAppSelector((state) => state.order);

  const [provinceList, setProvinceList] = useState<{ code: number; name: string }[]>([]);
  const [wardList, setWardList] = useState<{ code: number; name: string }[]>([]);
  const [wards, setWard] = useState<Ward[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayer, setFilterPayer] = useState("All");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterCOD, setFilterCOD] = useState("All");
  const [filterSenderWard, setFilterSenderWard] = useState("All");
  const [filterRecipientWard, setFilterRecipientWard] = useState("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // --- Fetch Orders ---
  const fetchOrders = (page = currentPage, search?: string) => {
    if (!office?.id) return;

    const payload: any = {
      officeId: office.id,
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      payer: filterPayer !== "All" ? filterPayer : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
      paymentMethod: filterPayment !== "All" ? filterPayment : undefined,
      paymentStatus: filterPaymentStatus !== "All" ? filterPaymentStatus : undefined,
      cod: filterCOD !== "All" ? filterCOD : undefined,
      senderWard: filterSenderWard !== "All" ? filterSenderWard : undefined,
      recipientWard: filterRecipientWard !== "All" ? filterRecipientWard : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    dispatch(getOrdersByOffice(payload));
  };

  useEffect(() => {
    dispatch(getPaymentMethodsEnum());
    dispatch(getStatusesEnum());
    dispatch(getPayersEnum());
    dispatch(getPaymentStatusesEnum());
    if (!office && user?.id !== undefined) {
      dispatch(getByUserId(user.id));
    }
  }, [dispatch]);

  // Fetch orders khi office có data
  useEffect(() => {
    if (office?.id) {
      fetchOrders();
    }
  }, [office?.id]);

  // --- Fetch province/ward ---
  useEffect(() => {
    // Fetch provinces
    axios
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/p/")
      .then((res) => setProvinceList(res.data))
      .catch((err) => console.error(err));

    // Fetch wards
    axios
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/w/")
      .then((res) => setWardList(res.data))
      .catch((err) => console.error(err));

    if (office?.codeCity) {
      axios
        .get<City>(`https://provinces.open-api.vn/api/v2/p/${office.codeCity}?depth=2`)
        .then((res) => {
          const wards: Ward[] = (res.data.wards || []).map((w) => ({
            code: w.code,
            name: w.name
          }));
          setWard(wards);
        })
        .catch((err) => console.error(err));
    }
  }, [office?.codeCity]);

  useEffect(() => { setCurrentPage(1); fetchOrders(1); }, [searchText, filterStatus, filterPayment, filterPayer, filterPaymentStatus, filterCOD, dateRange, filterSenderWard, filterRecipientWard]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        filters={{ status: filterStatus, payer: filterPayer, paymentStatus: filterPaymentStatus, paymentMethod: filterPayment, cod: filterCOD, senderWard: filterSenderWard, recipientWard: filterRecipientWard }}
        setFilters={(key, val) => {
          if (key === "status") setFilterStatus(val);
          if (key === "payer") setFilterPayer(val);
          if (key === "paymentStatus") setFilterPaymentStatus(val);
          if (key === "paymentMethod") setFilterPayment(val);
          if (key === "cod") setFilterCOD(val);
          if (key === "senderWard") setFilterSenderWard(val);
          if (key === "recipientWard") setFilterRecipientWard(val);
        }}
        statuses={statuses}
        payers={payers}
        paymentStatuses={paymentStatuses}
        paymentMethods={paymentMethods}
        wards={wards}
        onReset={() => {
          setSearchText(""); setFilterStatus("All"); setFilterPayment("All"); setFilterSenderWard("All");
          setFilterRecipientWard("All"); setFilterPayer("All"); setFilterPaymentStatus("All"); setFilterCOD("All");
          setDateRange(null); setCurrentPage(1); setShowAdvancedFilters(false);
        }}
      />

      <Row justify="end" style={{ marginBottom: 25, marginTop: 40 }}>
        <Col>
          <OrderActions
            onAdd={() => navigate("/${user.role}/orders/create")}
          />
        </Col>
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} đơn hàng</Tag>

      <OrderTable orders={orders} provinceList={provinceList} wardList={wardList} role={user?.role} officeId={office?.id} />

      <Modal title="Kết quả Import đơn hàng" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null} width={800} centered>
        <p>Demo import, chưa gửi server</p>
      </Modal>
    </div>
  );
};

export default OrderListManager;