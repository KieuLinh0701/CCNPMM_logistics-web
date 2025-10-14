import React, { useEffect, useState } from 'react';
import { Form, message, Modal } from 'antd';
import dayjs from 'dayjs';
import SearchFilters from './components/SearchFilters';
import Actions from './components/Actions';
import AddEditModal from './components/AddEditModal';
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux';
import RequestTable from './components/Table';
import { ShippingRequest } from '../../../../types/shippingRequest';
import { createRequest, cancelRequest, listUserRequests, getRequestStatuses, getRequestTypes, updateRequest } from '../../../../store/shippingRequestSlice';
import DetailModal from './components/DetailModal';
import { useNavigate } from 'react-router-dom';

const ShippingRequests: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAppSelector(state => state.auth);

  const [hover, setHover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
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
  const { requests = [], total = 0, requestTypes = [], statuses = [] } = useAppSelector((state) => state.request);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ShippingRequest | null>(null);

  const [editFromDetailModalVisible, setEditFromDetailModalVisible] = useState(false);

  const handleAddRequest = async () => {
    try {
      const result = await dispatch(createRequest(newRequest)).unwrap();
      if (result.success) {
        message.success(result.message || 'Thêm yêu cầu thành công!');
        setIsModalOpen(false);
        setNewRequest({});
        form.resetFields();
        fetchRequests(1);
      } else {
        message.error(result.message || 'Thêm yêu cầu thất bại!');
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || 'Có lỗi khi thêm yêu cầu!');
      } else {
        message.error('Có lỗi khi thêm yêu cầu!');
      }
    }
  };

  const handleEditRequest = async () => {
    await form.validateFields();
    try {
      const result = await dispatch(updateRequest({ request: newRequest }));

      if (result.payload && typeof result.payload === 'object' && 'success' in result.payload) {
        if (result.payload.success) {
          message.success(result.payload.message || 'Cập nhật yêu cầu thành công!');
          setIsModalOpen(false);
          setEditFromDetailModalVisible(false);
          setNewRequest({});
          form.resetFields();
          fetchRequests(currentPage);

          if (detailModalVisible && selectedRequest) {
            setSelectedRequest({
              ...selectedRequest,
              ...newRequest
            });
          }
        } else {
          message.error(result.payload.message || 'Cập nhật thất bại!');
        }
      } else {
        message.error('Cập nhật thất bại!');
      }
    } catch (error) {
      message.error('Cập nhật thất bại!');
    }
  };

  const handleCancelRequest = (requestId: number) => {
    Modal.confirm({
      title: "Xác nhận hủy yêu cầu",
      content: "Bạn có chắc chắn muốn hủy yêu cầu này không?",
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
          const resultAction = await dispatch(cancelRequest(requestId)).unwrap();
          if (resultAction.success) {
            message.success(resultAction.message || "Hủy yêu cầu thành công");
            fetchRequests(currentPage);
            if (detailModalVisible && selectedRequest) {
              setSelectedRequest({
                ...selectedRequest,
                status: 'Cancelled'
              });
            }
          } else {
            message.error(resultAction.message || "Hủy yêu cầu thất bại");
          }
        } catch (error: any) {
          message.error(error.message || "Lỗi server khi hủy yêu cầu");
        }
      },
    });
  };

  // Handler mở edit từ detail modal
  const handleEditFromDetail = (request: ShippingRequest) => {
    setNewRequest(request);
    setEditFromDetailModalVisible(true);
    form.setFieldsValue({
      id: request.id,
      trackingNumber: request.order?.trackingNumber,
      requestType: request.requestType,
      requestContent: request.requestContent,
    });
  };

  const fetchRequests = (page = currentPage, search?: string) => {
    const payload: any = {
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

    dispatch(listUserRequests(payload));
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
    setSort('All');
    setFilterStatus('All');
    setSort('newest');
    setDateRange(null);
    setCurrentPage(1);
    setFilterRequestType('All');
  };

  const handleViewDetail = (request: ShippingRequest) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const handleViewOrderDetail = (trackingNumber: string) => {
    if (user) {
      navigate(`/${user.role}/orders/detail/${trackingNumber}`);
    }
  };

  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    dispatch(listUserRequests({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    dispatch(getRequestTypes());
    dispatch(getRequestStatuses());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRequests(1);
  }, [searchText, sort, filterStatus, dateRange, filterRrequestType]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
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

      <Actions
        total={total}
        onAddRequest={() => {
          setIsModalOpen(true);
          setModalMode('create');
          setNewRequest({});
          form.resetFields();
        }}
      />
      {user &&
        <RequestTable
          data={requests}
          currentPage={currentPage}
          pageSize={pageSize}
          total={total}
          onEdit={(request) => {
            setModalMode('edit');
            setNewRequest(request);
            setIsModalOpen(true);
            form.setFieldsValue(request);
          }}
          onCancel={handleCancelRequest}
          onDetail={handleViewDetail}
          onPageChange={(page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchRequests(page);
          }}
          role={user.role}
        />
      }

      <AddEditModal
        open={isModalOpen}
        mode={modalMode}
        request={newRequest}
        requestTypes={requestTypes}
        onOk={modalMode === 'edit' ? handleEditRequest : handleAddRequest}
        onCancel={() => setIsModalOpen(false)}
        onRequestChange={setNewRequest}
        form={form}
      />

      {/* Modal edit từ detail */}
      <AddEditModal
        open={editFromDetailModalVisible}
        mode="edit"
        request={newRequest}
        requestTypes={requestTypes}
        onOk={handleEditRequest}
        onCancel={() => setEditFromDetailModalVisible(false)}
        onRequestChange={setNewRequest}
        form={form}
      />

      <DetailModal
        open={detailModalVisible}
        request={selectedRequest}
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
        onCancel={handleCancelRequest}
        onViewOrderDetail={handleViewOrderDetail}
      />
    </div>
  );
};

export default ShippingRequests;