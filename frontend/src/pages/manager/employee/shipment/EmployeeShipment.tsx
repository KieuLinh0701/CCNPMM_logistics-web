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
import { getShipmentStatuses, listEmployeeShipments } from "../../../../store/shipmentSlice";

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

  const { shipments = [], statuses = [], total = 0 } = useAppSelector(state => state.shipment);

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

  const handleExportEmployeesPerformance = async () => {
    // try {
    //   const params: any = {
    //     searchText: searchText || undefined,
    //     sort: filterSort !== "none" ? filterSort : undefined,
    //     role: filterRole !== "All" ? filterRole : undefined,
    //   };

    //   if (dateRange) {
    //     params.startDate = dateRange[0].startOf("day").toISOString();
    //     params.endDate = dateRange[1].endOf("day").toISOString();
    //   }

    //   const resultAction = await dispatch(exportEmployeePerformance(params));
    //   const payload = resultAction.payload as any;
    //   const data = Array.isArray(payload) ? payload : payload?.data ?? [];

    //   if (data.length === 0) {
    //     return message.info("Không có dữ liệu để xuất Excel");
    //   }

    //   const exportData = data.map((t: any) => ({
    //     "Mã nhân viên": t.employeeId,
    //     "Tên nhân viên": t.name,
    //     "Chức vụ": t.role,
    //     "Tổng số chuyến giao": t.totalShipments,
    //     "Tổng số đơn giao": t.totalOrders,
    //     "Số đơn giao thành công": t.completedOrders,
    //     "Tỉ lệ đơn thành công (%)": t.completionRate?.toFixed(2),
    //     "Thời gian trung bình/đơn (phút)": t.avgTimePerOrder?.toFixed(2),
    //   }));

    //   const worksheet = XLSX.utils.json_to_sheet(exportData);

    //   // Chỉnh độ rộng cột
    //   worksheet['!cols'] = [
    //     { wch: 15 }, // "Mã nhân viên"
    //     { wch: 20 }, // "Tên nhân viên"
    //     { wch: 15 }, // "Chức vụ"
    //     { wch: 20 }, // "Tổng số chuyến giao"
    //     { wch: 20 }, // "Tổng số đơn giao"
    //     { wch: 25 }, // "Số đơn giao thành công"
    //     { wch: 25 }, // "Tỉ lệ đơn thành công (%)"
    //     { wch: 30 }, // "Thời gian trung bình/đơn (phút)"
    //   ];

    //   const workbook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(workbook, worksheet, "Hiệu suất nhân viên");

    //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    //   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    //   saveAs(blob, `HieuSuatNhanVien${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
    // } catch (error) {
    //   console.error(error);
    //   message.error("Xuất Excel thất bại!");
    // }
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
        <Actions onExport={handleExportEmployeesPerformance} />
      </div>

      {/* Tag */}
      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>
        Kết quả trả về: {total} chuyến
      </Tag>

      {/* ShipmentTable */}
      <ShipmentTable shipments={shipments} onDetail={handleViewOrderShipmentsDetail} />
    </div>
  );
};

export default EmployeeShipment;