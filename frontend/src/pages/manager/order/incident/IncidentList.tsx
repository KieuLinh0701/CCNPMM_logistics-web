import { useEffect, useState } from "react";
import { Tag, message } from "antd";
import dayjs from "dayjs";
import SearchFilters from "./components/SearchFilters";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import { Incident } from "../../../../types/incidentReport";
import { getIncidentStatuses, getIncidentTypes, handleIncident, listOfficeIncidents } from "../../../../store/incidentReportSlice";
import Title from "antd/es/typography/Title";
import IncidentDetailModal from "./components/IncidentDetailModal";
import SummaryCard from "./components/SummaryCard";
import IncidentTable from "./components/Table";

const IncidentList = () => {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector(state => state.auth);
  const { incidents = [], total = 0, types = [], statuses = [], totalByStatus = [] } = useAppSelector((state) => state.incident);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSort, setFilterSort] = useState("newest");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>();

  // --- Fetch Transactions ---
  const fetchIncidents = (page = currentPage, search?: string) => {
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
    dispatch(listOfficeIncidents(payload));
  };

  const handleEditIncident = async (resolution: string, status: string) => {
    try {
      if (!selectedIncident?.id) return;

      const resultAction = await dispatch(
        handleIncident({
          incidentId: selectedIncident.id,
          status,
          resolution,
        })
      ).unwrap();

      if (resultAction.success) {
        message.success(resultAction.message || "Xử lý báo cáo thành công");
        fetchIncidents(currentPage);
      } else {
        message.error(resultAction.message || "Xử lý báo cáo thất bại");
      }
    } catch (error: any) {
      message.error(error.message || "Lỗi server khi xử lý báo cáo");
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setMode("view");
    setSelectedIncident(incident);
    setIsModalVisible(true);
  };

  const handleEditIncidentClick = (incident: Incident) => {
    setMode("edit");
    setSelectedIncident(incident);
    setIsModalVisible(true);
  };


  const handleModalClose = () => {
    setSelectedIncident(null);
    setIsModalVisible(false);
  };

  useEffect(() => {
    dispatch(getIncidentStatuses());
    dispatch(getIncidentTypes());
    fetchIncidents();
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchIncidents(1);
  }, [searchText, filterType, dateRange, filterSort, filterStatus]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      <SummaryCard
        totalByStatus={totalByStatus}
      />

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

      <Title level={3} style={{ color: '#1C3D90', margin: "30px 0px" }}>
        Danh sách sự cố
      </Title>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>Kết quả trả về: {total} báo cáo</Tag>

      {user &&
        <IncidentTable
          incidents={incidents}
          role={user.role}
          onViewIncident={handleViewIncident}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchIncidents(page);
          }}
          onEdit={handleEditIncidentClick}
        />
      }

      {user &&
        <IncidentDetailModal
          incident={selectedIncident}
          visible={isModalVisible}
          onClose={handleModalClose}
          role={user.role}
          statuses={statuses}
          onUpdate={handleEditIncident}
          initialMode={mode}
        />
      }
    </div>
  );
};

export default IncidentList;