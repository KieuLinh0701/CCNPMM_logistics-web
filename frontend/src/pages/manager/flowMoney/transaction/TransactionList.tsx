import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Row, Col, message, Modal } from "antd";
import dayjs from "dayjs";
import SearchFilters from "./components/SearchFilters";
import RevenueTable from "./components/Table";
import Actions from "./components/Actions";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SummaryCard from "./components/SummaryCard";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { translateTransactionPurpose, translateTransactionStatus, translateTransactionType } from "../../../../utils/transactionUtils";
import { createTransaction, exportManagerTransactions, getManagerTransactionSummary, getTransactionStatuses, getTransactionTypes, listManagerTransactions } from "../../../../store/transactionSlice";
import AddTransactionModal from "./components/AddTransactionModal";
import { Transaction } from "../../../../types/transaction";
import TransactionDetailModal from "./components/TransactionDetailModal";

const OfficeTransactionList = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { transactions = [], total = 0, types = [], statuses = [], totalExpense = 0, totalIncome = 0, balance = 0 } = useAppSelector((state) => state.transaction);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSort, setFilterSort] = useState("newest");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- Fetch Transactions ---
  const fetchTransactions = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      type: filterType !== "All" ? filterType : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
      sort: filterSort !== "newest" ? filterSort : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }
    dispatch(listManagerTransactions(payload));
    dispatch(getManagerTransactionSummary(payload));
  };

  const handleAddTransaction = () => setAddModalVisible(true);

  const handleSubmitTransaction = async (data: any) => {
    Modal.confirm({
      title: (
        <span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '17px' }}>
          Xác nhận tạo giao dịch
        </span>
      ),
      centered: true,
      content: "Giao dịch sau khi tạo sẽ không thể chỉnh sửa. Bạn có chắc chắn muốn tiếp tục?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: {
        style: {
          backgroundColor: "#1C3D90",
          color: "#fff",
        },
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#ffffff",
          borderColor: "#1C3D90",
          color: "#1C3D90",
        },
      },
      icon: null,
      async onOk() {
        try {
          const result = await dispatch(createTransaction(data)).unwrap();
          if (result.success) {
            message.success(result?.message || "Tạo giao dịch thành công");
          } else {
            message.error(result?.message || "Tạo giao dịch thất bại");
          }
          setAddModalVisible(false);
          fetchTransactions(currentPage);
        } catch (error: any) {
          message.error(error?.message || "Tạo giao dịch thất bại");
        }
      },
    });
  };

  const handleExportTransactions = async () => {
    try {
      const params: any = {
        searchText: searchText || undefined,
        type: filterType !== "All" ? filterType : undefined,
        status: filterStatus !== "All" ? filterStatus : undefined,
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
        "Trạng thái": translateTransactionStatus(t.status),
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

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
    setIsModalVisible(false);
  };

  useEffect(() => {
    dispatch(getTransactionTypes());
    dispatch(getTransactionStatuses());
    fetchTransactions();
  }, [dispatch]);

  useEffect(() => { setCurrentPage(1); fetchTransactions(1); }, [searchText, filterType, dateRange, filterSort, filterStatus]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>

      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateRange={dateRange}
        setDateRange={setDateRange}
        filters={{ type: filterType, sort: filterSort, status: filterStatus }}
        setFilters={(key, val) => {
          if (key === "type") setFilterType(val);
          if (key === "status") setFilterStatus(val);
          if (key === "sort") setFilterSort(val);
        }}
        types={types}
        statuses={statuses}
        onReset={() => {
          setSearchText("");
          setFilterType("All");
          setFilterStatus("All");
          setFilterSort("newest");
          setDateRange(null);
          setCurrentPage(1);
        }}
      />

      <SummaryCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
      />

      <Actions
        onExport={handleExportTransactions}
        onAdd={handleAddTransaction}
      />

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} giao dịch</Tag>

      {user &&
        <RevenueTable
          transactions={transactions}
          role={user.role}
          onViewTransaction={handleViewTransaction}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchTransactions(page);
          }}
        />
      }

      <AddTransactionModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        types={types}
        onSubmit={handleSubmitTransaction}
      />

      {user &&
        <TransactionDetailModal
          transaction={selectedTransaction}
          visible={isModalVisible}
          onClose={handleModalClose}
          role={user.role}
        />
      }
    </div>
  );
};

export default OfficeTransactionList;