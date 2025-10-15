import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Tag, Row, Col, message } from "antd";
import dayjs from "dayjs";
import {
  getOrderStatuses,
  getOrderPayers,
  getOrderPaymentMethods,
  getOrderPaymentStatuses,
  getOrdersByOfficeId,
  confirmAndAssignOrder,
  cancelManagerOrder,
} from "../../../../store/orderSlice";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import SearchFilters from "./components/SearchFilters";
import OrderTable from "./components/Table";
import OrderActions from "./components/Actions";
import { City, Ward } from "../../../../types/location";
import { getByUserId, getOfficesByArea } from "../../../../store/officeSlice";
import { Order } from "../../../../types/order";
import OfficeSelectionModal from "./components/OfficeSelectionModal";
import { RootState } from "../../../../store/store";
import { useSelector } from "react-redux";

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
  const [filterSort, setFilterSort] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayer, setFilterPayer] = useState("All");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterCOD, setFilterCOD] = useState("All");
  const [filterSenderWard, setFilterSenderWard] = useState("All");
  const [filterRecipientWard, setFilterRecipientWard] = useState("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { offices = [] } = useAppSelector(state => state.office);

  const [isOfficeSelectionModalVisible, setIsOfficeSelectionModalVisible] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      sort: filterSort !== "newest" ? filterSort : undefined,
      senderWard: filterSenderWard !== "All" ? filterSenderWard : undefined,
      recipientWard: filterRecipientWard !== "All" ? filterRecipientWard : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    dispatch(getOrdersByOfficeId(payload));
  };

  const handleViewOrderDetail = (trackingNumber: string) => {
  };

  const handleEditOrder = (trackingNumber: string) => {
    if (!user) return;
    navigate(`/${user.role}/orders/edit/${trackingNumber}`);
  };

  // Hàm xử lý khi nhấn nút "Duyệt"
  const handleApprove = async (order: Order) => {
    setSelectedOrder(order);

    // Lấy danh sách offices theo city của người nhận
    if (order.recipientCityCode) {
      try {
        await dispatch(getOfficesByArea({ codeCity: order.recipientCityCode })).unwrap();
        setIsOfficeSelectionModalVisible(true);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bưu cục:', error);
        message.error('Không thể tải danh sách bưu cục');
      }
    } else {
      setIsOfficeSelectionModalVisible(true);
    }
  };

  // Hàm xác nhận
  const handleConfirm = async (officeId: number) => {
    if (selectedOrder) {
      try {
        console.log('Đang xử lý order id:', selectedOrder.id);
        console.log('Đã chọn office:', officeId);

        const result = await dispatch(confirmAndAssignOrder({
          orderId: selectedOrder.id,
          officeId
        })).unwrap();

        if (result.success) {
          message.success(result.message || 'Xác nhận đơn hàng thành công');
        } else {
          message.error(result.message || 'Xác nhận đơn hàng thất bại');
        }

      } catch (error: any) {
        message.error(error.message || 'Lỗi khi xác nhận đơn hàng');
      }
    }

    setIsOfficeSelectionModalVisible(false);
    setSelectedOrder(null);
  };

  // Hàm hủy xác nhận
  const handleCancel = () => {
    setIsOfficeSelectionModalVisible(false);
    setSelectedOrder(null);
  };

  // Hàm hủy đơn hàng
  const handleCancelOrder = (orderId: number) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn hàng",
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      okText: "Hủy",
      cancelText: "Không",
      centered: true,
      icon: null,
      okButtonProps: {
        style: {
          backgroundColor: "#1C3D90",
          color: "#fff",
        },
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#e0e0e0",
          color: "#333",
        },
      },
      onOk: async () => {
        try {
          const resultAction = await dispatch(cancelManagerOrder(orderId)).unwrap();
          if (resultAction.success) {
            message.success(resultAction.message || "Hủy đơn hàng thành công");
            fetchOrders(currentPage);
          } else {
            message.error(resultAction.message || "Hủy đơn thất bại");
          }
        } catch (error: any) {
          message.error(error.message || "Lỗi server khi hủy đơn hàng");
        }
      },
    });
  };


  useEffect(() => {
    dispatch(getOrderPaymentMethods());
    dispatch(getOrderStatuses());
    dispatch(getOrderPayers());
    dispatch(getOrderPaymentStatuses());
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
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => setProvinceList(res.data))
      .catch((err) => console.error(err));

    // Fetch wards
    axios
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/w/")
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

  useEffect(() => { setCurrentPage(1); fetchOrders(1); }, [searchText, filterStatus, filterPayment, filterPayer, filterPaymentStatus, filterCOD, dateRange, filterSenderWard, filterRecipientWard, filterSort]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        filters={{ status: filterStatus, payer: filterPayer, paymentStatus: filterPaymentStatus, paymentMethod: filterPayment, cod: filterCOD, senderWard: filterSenderWard, recipientWard: filterRecipientWard, sort: filterSort }}
        setFilters={(key, val) => {
          if (key === "status") setFilterStatus(val);
          if (key === "payer") setFilterPayer(val);
          if (key === "paymentStatus") setFilterPaymentStatus(val);
          if (key === "paymentMethod") setFilterPayment(val);
          if (key === "cod") setFilterCOD(val);
          if (key === "sort") setFilterSort(val);
          if (key === "senderWard") setFilterSenderWard(val);
          if (key === "recipientWard") setFilterRecipientWard(val);
        }}
        statuses={statuses}
        payers={payers}
        paymentStatuses={paymentStatuses}
        paymentMethods={paymentMethods}
        wards={wards}
        onReset={() => {
          setSearchText(""); setFilterStatus("All"); setFilterPayment("All");
          setFilterSenderWard("All"); setFilterSort("newest");
          setFilterRecipientWard("All"); setFilterPayer("All");
          setFilterPaymentStatus("All"); setFilterCOD("All");
          setDateRange(null); setCurrentPage(1);
        }}
      />

      <Row justify="end" style={{ marginBottom: 25, marginTop: 40 }}>
        <Col>
          {user &&
            <OrderActions
              onAdd={() => navigate(`/${user.role}/orders/create`)}
            />
          }
        </Col>
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} đơn hàng</Tag>

      <OrderTable
        orders={orders}
        provinceList={provinceList}
        wardList={wardList}
        role={user?.role}
        officeId={office?.id}
        onDetail={handleViewOrderDetail}
        onEdit={handleEditOrder}
        onApprove={handleApprove}
        oncancel={handleCancelOrder}
      />
      {selectedOrder && <OfficeSelectionModal
        open={isOfficeSelectionModalVisible}
        offices={offices}
        trackingNumber={selectedOrder.trackingNumber}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      }
    </div>
  );
};

export default OrderListManager;