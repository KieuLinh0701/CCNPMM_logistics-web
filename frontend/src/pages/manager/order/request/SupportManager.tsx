import React, { useEffect, useState } from 'react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import SearchFilters from './components/SearchFilters';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux';
import RequestTable from './components/Table';
import { ShippingRequest } from '../../../../types/shippingRequest';
import { listOfficeRequests, getRequestStatuses, getRequestTypes, updateRequestByManager } from '../../../../store/shippingRequestSlice';
import RequestModal from './components/RequestModal';
import { useNavigate } from 'react-router-dom';
import { getByUserId } from '../../../../store/officeSlice';
import { City, Ward } from '../../../../types/location';
import axios from "axios";
import RequestStatusSummaryCard from './components/RequestStatusSummaryCard';
import Title from 'antd/es/typography/Title';

const SupportManager: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAppSelector(state => state.auth);
  const { office, loading } = useAppSelector(state => state.office);

  const [hover, setHover] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<ShippingRequest>>({});

  const [searchText, setSearchText] = useState('');
  const [filterRrequestType, setFilterRequestType] = useState("All");
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { requests = [], total = 0, requestTypes = [], statuses = [], statusSummary = [] } = useAppSelector((state) => state.request);

  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShippingRequest | null>(null);

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // --- Fetch province/ward ---
  useEffect(() => {
    // Fetch provinces
    axios
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/p/")
      .then((res) => setCities(res.data))
      .catch((err) => console.error(err));

    // Fetch wards
    axios
      .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/w/")
      .then((res) => setWards(res.data))
      .catch((err) => console.error(err));
  }, []);


  // Handle cập nhật request
  const handleEdit = async (response: string, status: string) => {
    if (!selectedRequest) {
      message.error("Chưa chọn yêu cầu để cập nhật");
      return;
    }

    if (!status) {
      message.error("Vui lòng chọn trạng thái trước khi cập nhật");
      return;
    }

    try {
      const result = await dispatch(
        updateRequestByManager({
          requestId: selectedRequest.id,
          data: { response, status },
        })
      );

      if (result.payload && typeof result.payload === "object" && "success" in result.payload) {
        if (result.payload.success) {
          message.success(result.payload.message || "Cập nhật yêu cầu thành công!");
          setMode("view");
          setRequestModalVisible(true);
          setNewRequest({});
          form.resetFields();
          fetchRequests(currentPage);

          if (requestModalVisible && selectedRequest) {
            setSelectedRequest({
              ...selectedRequest,
              response,
              status: status as "Pending" | "Processing" | "Resolved" | "Rejected" | "Cancelled",
            });
          }
        } else {
          message.error(result.payload.message || "Cập nhật thất bại!");
        }
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  const fetchRequests = (page = currentPage, search?: string) => {
    if (!office?.id) {
      return;
    }

    const payload: any = {
      officeId: office.id,
      page,
      limit: pageSize,
      searchText: search !== undefined ? search : searchText,
      type: filterRrequestType !== 'All' ? filterRrequestType : undefined,
      status: filterStatus !== 'All' ? filterStatus : undefined,
      sort: sort !== 'newest' ? sort : undefined,
    };

    if (dateRange) {
      payload.startDate = dateRange[0].startOf('day').toISOString();
      payload.endDate = dateRange[1].endOf('day').toISOString();
    }

    console.log('📡 Fetching requests with payload:', payload);
    dispatch(listOfficeRequests(payload));
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case 'sort':
        setSort(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'requestType':
        setFilterRequestType(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterRequestType('All');
    setFilterStatus('All');
    setSort('newest');
    setDateRange(null);
    setCurrentPage(1);
  };

  const handleViewDetail = (request: ShippingRequest) => {
    setSelectedRequest(request);
    setRequestModalVisible(true);
  };

  const handleViewOrderDetail = (trackingNumber: string) => {
    if (user) {
      navigate(`/${user.role}/orders/detail/${trackingNumber}`);
    }
  };

  const handleCloseDetail = () => {
    setRequestModalVisible(false);
    setSelectedRequest(null);
  };

  // useEffect cho initial data
  useEffect(() => {
    dispatch(getRequestTypes());
    dispatch(getRequestStatuses());
    if (!office && user?.id !== undefined) {
      dispatch(getByUserId(user.id));
    }
  }, [dispatch, user, office]);

  // useEffect cho initial load khi office có
  useEffect(() => {
    if (office?.id) {
      fetchRequests(1);
    }
  }, [office?.id]);

  // useEffect cho filter changes
  useEffect(() => {
    if (office?.id) {
      setCurrentPage(1);
      fetchRequests(1);
    }
  }, [searchText, sort, filterStatus, dateRange, filterRrequestType]);

  // useEffect cho pagination
  useEffect(() => {
    if (office?.id) {
      fetchRequests(currentPage);
    }
  }, [currentPage, pageSize]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
      <Title level={3} style={{ color: '#1C3D90', margin: 0, marginBottom: 20 }}>
        Hỗ trợ & Khiếu nại
      </Title>

      <RequestStatusSummaryCard 
        data={statusSummary}
      />

      <SearchFilters
        searchText={searchText}
        filterRrequestType={filterRrequestType}
        filterStatus={filterStatus}
        sort={sort}
        dateRange={dateRange}
        hover={hover}
        requestTypes={requestTypes}
        statuses={statuses}
        onSearchChange={setSearchText}
        onFilterChange={handleFilterChange}
        onSortChange={setSort}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
        onHoverChange={setHover}
      />

      {user &&
        <RequestTable
          data={requests}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          wards={wards}
          cities={cities}
          onProcess={(request) => {
            setSelectedRequest(request);
            setMode('edit');
            setRequestModalVisible(true);
          }}
          onDetail={handleViewDetail}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchRequests(page);
          }}
          role={user.role}
        />
      }

      <RequestModal
        open={requestModalVisible}
        request={selectedRequest}
        mode={mode}
        statuses={statuses}
        onClose={handleCloseDetail}
        onUpdate={handleEdit}
        onEdit={() => setMode('edit')}
        onCancelEdit={() => setMode('view')}
        onViewOrderDetail={handleViewOrderDetail}
        wards={wards}
        cities={cities}
      />
    </div>
  );
};

export default SupportManager;