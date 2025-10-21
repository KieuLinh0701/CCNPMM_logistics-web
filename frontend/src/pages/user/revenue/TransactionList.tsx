import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Row, Col, message } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import SearchFilters from "./components/SearchFilters";
import RevenueTable from "./components/Table";
import Actions from "./components/Actions";
import { exportUserTransactions, getTransactionTypes, listUserTransactions } from "../../../store/transactionSlice";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { translateTransactionPurpose, translateTransactionType } from "../../../utils/transactionUtils";

const TransactionList = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { transactions = [], total = 0, types = [] } = useAppSelector((state) => state.transaction);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSort, setFilterSort] = useState("newest");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // --- Fetch Transactions ---
  const fetchTransactions = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      type: filterType !== "All" ? filterType : undefined,
      sort: filterSort !== "newest" ? filterSort : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }
    dispatch(listUserTransactions(payload));
  };

  const handleExportTransactions = async () => {
    try {
      const params: any = {
        searchText: searchText || undefined,
        type: filterType !== "All" ? filterType : undefined,
        sort: filterSort,
      };

      if (dateRange) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const resultAction = await dispatch(exportUserTransactions(params));
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

  useEffect(() => {
    dispatch(getTransactionTypes());
    fetchTransactions();
  }, [dispatch]);

  useEffect(() => { setCurrentPage(1); fetchTransactions(1); }, [searchText, filterType, dateRange, filterSort]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        setSearchText={setSearchText}
        dateRange={dateRange}
        setDateRange={setDateRange}
        filters={{ type: filterType, sort: filterSort }}
        setFilters={(key, val) => {
          if (key === "type") setFilterType(val);
          if (key === "sort") setFilterSort(val);
        }}
        types={types}
        onReset={() => {
          setSearchText("");
          setFilterType("All");
          setFilterSort("newest");
          setDateRange(null);
          setCurrentPage(1);
        }}
      />

      <Row justify="end" style={{ marginBottom: 25, marginTop: 40 }}>
        <Col>
          {<Actions
            onExport={handleExportTransactions}
          />}
        </Col>
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} giao dịch</Tag>

      {user &&
        <RevenueTable
          transactions={transactions}
          role={user.role} />
      }
    </div>
  );
};

export default TransactionList;