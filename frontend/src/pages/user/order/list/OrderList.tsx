import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, message, Tag, Row, Col } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import {
  cancelOrder,
  getOrdersByUser,
  getPayersEnum,
  getPaymentMethodsEnum,
  getPaymentStatusesEnum,
  getStatusesEnum,
} from "../../../../store/orderSlice";
import OrderActions from "./components/Actions";
import * as XLSX from "xlsx";
import { Order } from "../../../../types/order";
import SearchFilters from "./components/SearchFilters";
import OrderTable from "./components/Table";
import { useStyleRegister } from "antd/es/theme/internal";

const OrderList = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);

  const { orders = [], total = 0, paymentMethods = [], statuses = [], payers = [], paymentStatuses = [] } = useAppSelector((state) => state.order);

  const [provinceList, setProvinceList] = useState<{ code: number; name: string }[]>([]);
  const [wardList, setWardList] = useState<{ code: number; name: string }[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSort, setFilterSort] = useState("newest");
  const [filterPayer, setFilterPayer] = useState("All");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterCOD, setFilterCOD] = useState("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);

  // --- Fetch Orders ---
  const fetchOrders = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      payer: filterPayer !== "All" ? filterPayer : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
      paymentMethod: filterPayment !== "All" ? filterPayment : undefined,
      paymentStatus: filterPaymentStatus !== "All" ? filterPaymentStatus : undefined,
      cod: filterCOD !== "All" ? filterCOD : undefined,
      sort: filterSort !== "newest" ? filterSort : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }
    dispatch(getOrdersByUser(payload));
  };

  // --- Cancel Order ---
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
          const resultAction = await dispatch(cancelOrder(orderId)).unwrap();
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

  // --- Excel Import ---
  const handleExcelUpload = (file: File): boolean => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newOrders: Partial<Order>[] = rows.map(row => ({
          senderName: row["Tên người gửi"]?.trim() || "",
          senderPhone: row["SĐT người gửi"]?.trim() || "",
          recipientName: row["Tên người nhận"]?.trim() || "",
          recipientPhone: row["SĐT người nhận"]?.trim() || "",
          weight: row["Trọng lượng (kg)"] ?? 0,
          paymentMethod: row["Phương thức thanh toán"]?.trim() || "Cash",
          status: row["Trạng thái"]?.trim() || "pending",
          notes: row["Ghi chú"]?.trim() || "",
        }));

        const invalidRows = newOrders.filter(o => !o.senderName || !o.recipientName || !o.weight);
        if (invalidRows.length > 0) {
          message.error("Có dòng bị thiếu thông tin bắt buộc. Vui lòng kiểm tra lại file!");
          return;
        }

        message.success("Đọc file Excel thành công. Chưa gửi lên server trong demo này.");
      } catch (error) {
        message.error("Có lỗi khi đọc file Excel!");
      }
    };
    reader.readAsArrayBuffer(file);

    return false;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      {
        "Tên người gửi": "Nguyen Van A",
        "SĐT người gửi": "0123456789",
        "Tên người nhận": "Tran Thi B",
        "SĐT người nhận": "0987654321",
        "Trọng lượng (kg)": 1.5,
        "Phương thức thanh toán": "Cash",
        "Trạng thái": "pending",
        "Ghi chú": "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const header = Object.keys(data[0]);
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 0 });
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "order_template.xlsx");
  };

  const handleAdd = () => {
    if (user) {
      navigate(`/${user.role}/orders/create`);
    }
  };

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
  }, []);

  useEffect(() => {
    dispatch(getPaymentMethodsEnum());
    dispatch(getStatusesEnum());
    dispatch(getPayersEnum());
    dispatch(getPaymentStatusesEnum());
    fetchOrders();
  }, [dispatch]);

  useEffect(() => { setCurrentPage(1); fetchOrders(1); }, [searchText, filterStatus, filterPayment, filterPayer, filterPaymentStatus, filterCOD, dateRange, filterSort ]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateRange={dateRange}
        setDateRange={setDateRange}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        filters={{ status: filterStatus, payer: filterPayer, paymentStatus: filterPaymentStatus, paymentMethod: filterPayment, cod: filterCOD, sort: filterSort }}
        setFilters={(key, val) => {
          if (key === "status") setFilterStatus(val);
          if (key === "payer") setFilterPayer(val);
          if (key === "paymentStatus") setFilterPaymentStatus(val);
          if (key === "paymentMethod") setFilterPayment(val);
          if (key === "cod") setFilterCOD(val);
          if (key === "sort") setFilterSort(val);
        }}
        statuses={statuses}
        payers={payers}
        paymentStatuses={paymentStatuses}
        paymentMethods={paymentMethods}
        onReset={() => {
          setSearchText(""); setFilterStatus("All"); 
          setFilterPayment("All"); setFilterSort("newest");
          setFilterPayer("All"); setFilterPaymentStatus("All"); setFilterCOD("All");
          setDateRange(null); setCurrentPage(1); 
        }}
      />

      <Row justify="end" style={{ marginBottom: 25, marginTop: 40 }}>
        <Col>
          {user && <OrderActions
            onAdd={handleAdd}
            onUpload={handleExcelUpload}
            onDownloadTemplate={handleDownloadTemplate}
          />}
        </Col>
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} đơn hàng</Tag>

      {user &&
        <OrderTable orders={orders} provinceList={provinceList} wardList={wardList} onCancel={handleCancelOrder} role={user.role} />
      }

      <Modal title="Kết quả Import đơn hàng" open={importModalOpen} onCancel={() => setImportModalOpen(false)} footer={null} width={800} centered>
        <p>Demo import, chưa gửi server</p>
      </Modal>
    </div>
  );
};

export default OrderList;