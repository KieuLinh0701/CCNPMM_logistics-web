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
import { translateTransactionMethod, translateTransactionPurpose, translateTransactionType } from "../../../utils/transactionUtils";
import FlowMoneyCard from "./components/FlowMoneyCard";
import { getUserConfirmedOrdersSummary, getUserPendingOrdersSummary } from "../../../store/paymentSubmissionSlice";

const TransactionList = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { transactions = [], total = 0, types = [] } = useAppSelector((state) => state.transaction);
  const { pending, confirmed } = useAppSelector(state => state.submission);

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
        "Phương thức": translateTransactionMethod(t.method),
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
    dispatch(getUserPendingOrdersSummary());
    dispatch(getUserConfirmedOrdersSummary());
  }, [dispatch]);

  useEffect(() => { setCurrentPage(1); fetchTransactions(1); }, [searchText, filterType, dateRange, filterSort]);

  return (
    <div style={{ padding: 16, background: "#F9FAFB", borderRadius: 12 }}>
      <FlowMoneyCard
        data1={[
          {
            label: 'Tiền đang luân chuyển',
            value: (pending.totalCOD || 0).toLocaleString() + '\u00A0\u00A0VNĐ',
            tooltip: 'Tổng tiền các đơn hàng của bạn đang chờ đối soát'
          },
          {
            label: 'Phí thu hộ COD',
            value: ((pending.totalCOD || 0) * 0.005).toLocaleString() + '\u00A0\u00A0VNĐ',
            tooltip: 'Phí thu hộ khi nhận tiền từ khách (0.5% giá trị COD)'
          },
          {
            label: 'Phí bảo hiểm',
            value: ((pending.totalOrderValue || 0) * 0.02).toLocaleString() + '\u00A0\u00A0VNĐ',
            tooltip: 'Phí bảo hiểm hàng hóa (2% giá trị đơn hàng)'
          },
          {
            label: 'Số đơn hàng',
            value: (pending.orderCount || 0).toLocaleString() + '\u00A0\u00A0ĐH\u00A0\u00A0',
            tooltip: 'Số đơn hàng đang chờ đối soát'
          },
        ]}
        data2={[
          {
            label: 'Tiền COD đã ký nhận (VNĐ)',
            value: ((confirmed.totalCOD || 0).toLocaleString()) + '\u00A0\u00A0VNĐ',
            tooltip: 'Tổng tiền các đơn hàng của bạn đã đối soát'
          },
          {
            label: 'Phí thu hộ COD (VNĐ)',
            value: (((confirmed.totalCOD || 0) * 0.005).toLocaleString()) + '\u00A0\u00A0VNĐ',
            tooltip: 'Phí thu hộ khi nhận tiền từ khách (0.5% giá trị COD)'
          },
          {
            label: 'Phí bảo hiểm',
            value: ((confirmed.totalOrderValue || 0) * 0.02).toLocaleString() + '\u00A0\u00A0VNĐ',
            tooltip: 'Phí bảo hiểm hàng hóa (2% giá trị đơn hàng)'
          },
          {
            label: 'Số đơn hàng',
            value: (confirmed.orderCount || 0).toLocaleString() + '\u00A0\u00A0ĐH\u00A0\u00A0',
            tooltip: 'Số đơn hàng đã đối soát'
          }
        ]}
      />

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

      <Actions
        onExport={handleExportTransactions}
      />

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} giao dịch</Tag>

      {user &&
        <RevenueTable
          transactions={transactions}
          role={user.role}
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
    </div>
  );
};

export default TransactionList;