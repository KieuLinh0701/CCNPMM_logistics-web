import { useEffect, useState } from "react";
import { message, Tag } from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import SearchFilters from "./components/SearchFilters";
import ShipmentTable from "./components/Table";
import { exportEmployeePerformance, getEmployeePerformance } from "../../../../store/employeeSlice";
import Actions from "./components/Actions";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate, useParams } from "react-router-dom";
import { exportEmployeeShipments, getShipmentStatuses, listEmployeeShipments } from "../../../../store/shipmentSlice";
import { translateShipmentStatus } from "../../../../utils/shipmentUtils";

const EmployeeShipment = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { employeeId } = useParams<{ employeeId: string }>();

  const empId = Number(employeeId);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterSort, setFilterSort] = useState("none");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { shipments = [], statuses = [], total = 0, exportShipments = [] } = useAppSelector(state => state.shipment);

  const fetchShipments = (page = currentPage, search?: string) => {
    if (!empId) return;

    const payload: any = {
      employeeId: empId,
      page,
      limit: pageSize,
      sort: filterSort !== "none" ? filterSort : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    dispatch(listEmployeeShipments(payload));
  };

  const handleViewOrderShipmentsDetail = (shipmentId: number) => {
    navigate(`/manager/employees/performance/${empId}/shipments/${shipmentId}/orders`);
  };

  const handleExportEmployeeShipments = async () => {
    try {
      const params: any = {
        employeeId: empId,
        sort: filterSort !== "none" ? filterSort : undefined,
        status: filterStatus !== "All" ? filterStatus : undefined,
      };

      if (dateRange) {
        params.startDate = dateRange[0].startOf("day").toISOString();
        params.endDate = dateRange[1].endOf("day").toISOString();
      }

      const resultAction = await dispatch(exportEmployeeShipments(params));
      const payload = resultAction.payload as any;
      const data = Array.isArray(payload) ? payload : payload?.exportShipments ?? [];

      if (data.length === 0) {
        return message.info("Không có dữ liệu để xuất Excel");
      }

      // Map dữ liệu xuất Excel theo bảng hiển thị
      const exportData = data.map((t: any) => ({
        "Mã chuyến": t.id,
        "Trạng thái": translateShipmentStatus(t.status) || "N/A",
        "Biển số phương tiện": t.vehicle?.licensePlate || "N/A",
        "Tải trọng xe (kg)": t.vehicle?.capacity || "N/A",
        "Tổng số đơn": t.orderCount ?? 0,
        "Tổng trọng lượng (kg)": Number(t.totalWeight || 0).toFixed(2),
        "Thời gian bắt đầu": t.startTime
          ? dayjs(t.startTime).locale("vi").format("DD/MM/YYYY HH:mm")
          : "N/A",
        "Thời gian kết thúc": t.endTime
          ? dayjs(t.endTime).locale("vi").format("DD/MM/YYYY HH:mm")
          : "N/A",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Căn chỉnh độ rộng cột (dựa trên độ dài tên cột và dữ liệu)
      worksheet["!cols"] = [
        { wch: 12 }, // Mã chuyến
        { wch: 15 }, // Trạng thái
        { wch: 18 }, // Biển số phương tiện
        { wch: 20 }, // Tên phương tiện
        { wch: 18 }, // Tổng số đơn
        { wch: 22 }, // Tổng trọng lượng (kg)
        { wch: 22 }, // Thời gian bắt đầu
        { wch: 22 }, // Thời gian kết thúc
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách chuyến giao");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      saveAs(blob, `DanhSachChuyenGiao_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
    } catch (error) {
      console.error(error);
      message.error("Xuất Excel thất bại!");
    }
  };

  useEffect(() => {
    dispatch(getShipmentStatuses());
    fetchShipments();
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchShipments(1);
  }, [searchText, dateRange, filterSort, filterStatus]);

  useEffect(() => {
    console.log("shipments", shipments);
  }, [shipments])

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      {/* SearchFilters */}
      <div style={{ marginBottom: 16 }}>
        <SearchFilters
          searchText={searchText}
          setSearchText={setSearchText}
          dateRange={dateRange}
          setDateRange={setDateRange}
          filters={{ sort: filterSort, status: filterStatus }}
          setFilters={(key, val) => {
            if (key === "sort") setFilterSort(val);
            if (key === "status") setFilterStatus(val);
          }}
          onReset={() => {
            setSearchText("");
            setFilterSort("none");
            setFilterStatus("All");
            setDateRange(null);
            setCurrentPage(1);
          }}
          statuses={statuses}
        />
      </div>

      {/* Actions */}
      <div style={{ marginBottom: 16 }}>
        <Actions onExport={handleExportEmployeeShipments} />
      </div>

      {/* Tag */}
      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>
        Kết quả trả về: {total} chuyến
      </Tag>

      {/* ShipmentTable */}
      <ShipmentTable
        shipments={shipments}
        onDetail={handleViewOrderShipmentsDetail}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size) setPageSize(size);
          fetchShipments(page);
        }}
      />
    </div>
  );
};

export default EmployeeShipment;