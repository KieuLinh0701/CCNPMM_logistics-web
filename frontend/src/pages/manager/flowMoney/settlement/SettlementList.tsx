import React, { useEffect, useState } from "react";
import { Tag, Row, Col, message, Table, Modal } from "antd";
import dayjs from "dayjs";
import SearchFilters from "./components/SearchFilters";
import SubmissionTable from "./components/Table";
import Actions from "./components/Actions";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SummaryCard from "./components/SummaryCard";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { translateTransactionPurpose, translateTransactionType } from "../../../../utils/transactionUtils";
import { exportManagerTransactions, getManagerTransactionSummary, getTransactionTypes, listManagerTransactions } from "../../../../store/transactionSlice";
import { getOrdersOfPaymentSubmission, getPaymentSubmissionCountByStatus, getPaymentSubmissionStatuses, listManagerPaymentSubmission, updatePaymentSubmissionStatus } from "../../../../store/paymentSubmissionSlice";
import { PaymentSubmission } from "../../../../types/paymentSubmission";
import { Order } from "../../../../types/order";
import type { ColumnsType } from "antd/es/table";
import PaymentSubmissionOrdersModal from "./components/PaymentSubmissionOrdersModal";
import ProcessPaymentSubmissionModal from "./components/ProcessPaymentSubmissionModal";


const OfficeSettlementList = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { statuses = [], paymentSubmissions = [], total = 0, orders = [], summary = [] } = useAppSelector((state) => state.submission);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterSort, setFilterSort] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // --- State Modal ---
  const [ordersModalVisible, setOrdersModalVisible] = useState(false);
  const [modalOrders, setModalOrders] = useState<Order[]>([]);
  const [modalSubmissionInfo, setModalSubmissionInfo] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [modalLimit, setModalLimit] = useState(10);
  const [modalTotal, setModalTotal] = useState(0);

  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);

  // --- Fetch Transactions ---
  const fetchSettlements = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      status: filterStatus !== "All" ? filterStatus : undefined,
      searchText: search ?? searchText,
      sort: filterSort !== "newest" ? filterSort : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }
    dispatch(listManagerPaymentSubmission(payload));
  };

  const handleExportPaymentSubmissions = async () => {
    try {
      const params: any = {
        searchText: searchText || undefined,
        sort: filterSort,
      };

      if (dateRange) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const resultAction = await dispatch(exportManagerTransactions(params));
      const payload = resultAction.payload as any;
      const data = Array.isArray(payload) ? payload : payload?.transactions ?? [];

      if (data.length === 0) {
        return message.info("Không có dữ liệu để xuất Excel");
      }

      const exportData = data.map((t: any) => ({
        "Mã giao dịch": t.id,
        "Mã đơn hàng": t.order?.trackingNumber || "N/A",
        "Loại": translateTransactionType(t.type),
        "Mục đích": translateTransactionPurpose(t.purpose),
        "Số tiền (VNĐ)": t.amount?.toLocaleString("vi-VN"),
        "Phương thức": t.method,
        "Ngày xác nhận": t.confirmedAt
          ? dayjs(t.confirmedAt).format("DD/MM/YYYY HH:mm")
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Giao dịch");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      saveAs(blob, `DanhSachGiaoDich_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
    } catch (error) {
      console.error(error);
      message.error("Xuất Excel thất bại!");
    }
  };

  const handleProcessPaymentSubmission = (submission: PaymentSubmission) => {
    setSelectedSubmission(submission);
    setProcessModalVisible(true);
  };

  const handleSubmitProcess = async (status: string, notes: string) => {
    if (!selectedSubmission) return;

    try {
      // gọi API update status
      const resultAction = await dispatch(updatePaymentSubmissionStatus({
        id: selectedSubmission.id,
        status,
        notes
      }));

      const payload = resultAction.payload as any;

      if (payload.success) {
        message.success(payload.message || "Cập nhật trạng thái thành công");
        fetchSettlements();
        setSelectedSubmission(null);
      } else {
        message.error(payload.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleViewOrders = async (submissionId: number, page = 1) => {
    try {
      setModalLoading(true);
      const resultAction = await dispatch(
        getOrdersOfPaymentSubmission({ submissionId, page, limit: modalLimit })
      );
      const payload = resultAction.payload as any;

      if (payload.success) {
        setModalOrders(payload.orders);
        setModalSubmissionInfo(payload.submission);
        setModalTotal(payload.total);
        setModalPage(payload.page);
        setOrdersModalVisible(true);
      } else {
        message.error(payload.message || "Lấy danh sách đơn hàng thất bại");
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi lấy danh sách đơn hàng");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    dispatch(getPaymentSubmissionStatuses());
    dispatch(getPaymentSubmissionCountByStatus())
    fetchSettlements();
  }, [dispatch]);

  useEffect(() => { setCurrentPage(1); fetchSettlements(1); }, [searchText, dateRange, filterSort, filterStatus]);

  return (
    <>
      <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
        <SummaryCard
          data={summary}
        />

        <SearchFilters
          searchText={searchText}
          setSearchText={setSearchText}
          dateRange={dateRange}
          setDateRange={setDateRange}
          statuses={statuses}
          filters={{
            sort: filterSort,
            status: filterStatus,
          }}
          setFilters={(key, val) => {
            if (key === "sort") setFilterSort(val as string);
            if (key === "status") setFilterStatus(val as string);
          }}
          onReset={() => {
            setSearchText("");
            setFilterStatus("All");
            setFilterSort("newest");
            setDateRange(null);
            setCurrentPage(1);
          }}
        />

        <Actions
          onExport={handleExportPaymentSubmissions}
        />

        <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} đối soát</Tag>

        <SubmissionTable
          submissions={paymentSubmissions}
          onDetail={handleViewOrders}
          onProcess={handleProcessPaymentSubmission}
        />
      </div>

      {user &&
        <PaymentSubmissionOrdersModal
          visible={ordersModalVisible}
          loading={modalLoading}
          orders={modalOrders}
          page={modalPage}
          limit={modalLimit}
          total={modalTotal}
          onPageChange={(page) => handleViewOrders(modalSubmissionInfo?.id, page)}
          onClose={() => setOrdersModalVisible(false)}
          role={user.role}
        />
      }

      <ProcessPaymentSubmissionModal
        visible={processModalVisible}
        submission={selectedSubmission}
        onClose={() => setProcessModalVisible(false)}
        onSubmit={handleSubmitProcess}
      />
    </>
  );
};

export default OfficeSettlementList;