import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import SearchFilters from './components/SearchFilters';
import Actions from './components/Actions';
import VehicleTable from './components/VehicleTable';
import AddOrEditModal from './components/AddOrEditModal';
import ImportResults from './components/ImportResults';
import { addVehicle, getStatusesEnum, getTypesEnum, getVehiclesByOffice, importVehicles, updateVehicle } from '../../../store/vehicleSlice';
import { getByUserId } from '../../../store/officeSlice';
import { Vehicle } from '../../../types/vehicle';
import VehicleStatusCards from './components/VehicleStatusCards';

const Vehicles: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const { office, loading } = useAppSelector(state => state.office);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVehicle, setSelectedVehicle] = useState<Partial<any>>({});
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterOffice, setFilterOffice] = useState<string>('All');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hover, setHover] = useState(false);
  const [form] = Form.useForm();

  const {
    vehicles = [], 
    total = 0,
    statuses = [],
    types = [],
    importResults = [],
    totalImported = 0,
    totalFailed = 0,
    statusCounts = [],
  } = useAppSelector((state) => state.vehicle);

  const dispatch = useAppDispatch();

  const handleAddVehicle = async () => {
    await form.validateFields();
    try {
      if (!office?.id) return;

      const result = await dispatch(addVehicle({
        officeId: office.id,
        vehicle: selectedVehicle
      })).unwrap();

      message.success(result.message || 'Thêm phương tiện thành công!');

      setIsModalOpen(false);
      setCurrentPage(1);
      fetchVehicles(1);
    } catch (error: any) {
      message.error(error || 'Có lỗi khi thêm phương tiện!');
    }
  };

  const handleEditVehicle = async () => {
    await form.validateFields();
    try {
      console.log("result", selectedVehicle);
      const result = await dispatch(updateVehicle({
        vehicle: selectedVehicle
      })).unwrap();

      console.log("kq", result);

      message.success(result.message || 'Cập nhật phương tiện thành công!');

      setIsModalOpen(false);
      setCurrentPage(1);
      fetchVehicles(1);
    } catch (error: any) {
      message.error(error || 'Có lỗi khi cập nhật phương tiện!');
    }
  };

  const handleExcelUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          message.error("Không tìm thấy sheet trong file Excel!");
          return;
        }

        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const newVehicles: Partial<Vehicle>[] = rows.map((row, index) => {
          return {
            licensePlate: row["Biển số xe"]?.toString().trim() || "",
            type: row["Loại xe"]?.toString().trim() || "",
            capacity: row["Tải trọng (kg)"],
            description: row["Mô tả"]?.toString().trim() || "",
          };
        });

        console.log("Dữ liệu gửi lên API:", newVehicles);

        if (!office?.id) return;

        // Gửi lên API 
        const resultAction = await dispatch(importVehicles({
          officeId: office.id,
          vehicles: newVehicles
        })).unwrap();

        if (resultAction?.success) {
          message.success(resultAction?.message || "Import phương tiện thành công!");
          setImportModalOpen(true);
          setCurrentPage(1);
          fetchVehicles(1);
        } else {
          message.error(resultAction?.message || "Import thất bại");
        }

      } catch (err: any) {
        message.error(err.message);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const data = [
      {
        "Biển số xe": "51A-123.45",
        "Loại xe": "Truck / Van",
        "Tải trọng (kg)": 1000,
        "Mô tả": "Xe tải màu trắng",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);

    const header = ["Biển số xe", "Loại xe", "Tải trọng (kg)", "Mô tả"];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: "A1" });

    ws["!cols"] = [
      { wch: 20 }, // Biển số xe
      { wch: 15 }, // Loại xe
      { wch: 15 }, // Tải trọng
      { wch: 30 }, // Mô tả
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "vehicle_template.xlsx");
  };

  const fetchVehicles = (page = currentPage, search?: string) => {
    if (!office?.id) return;

    const payload: any = {
      officeId: office.id,
      page,
      limit: pageSize,
      searchText: search ?? searchText,
      status: filterStatus !== "All" ? filterStatus : undefined,
      type: filterType !== "All" ? filterType : undefined,
      sort: sort != "newest" ? sort : undefined,
    };
    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    console.log("vehicle: ", payload);

    dispatch(getVehiclesByOffice(payload));
    console.log("vehicles: ", vehicles);
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case 'type':
        setFilterType(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterType('All');
    setFilterStatus('All');
    setFilterOffice('All');
    setSort('newest');
    setDateRange(null);
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    dispatch(getStatusesEnum());
    dispatch(getTypesEnum());
    if (!office && user?.id !== undefined) {
      dispatch(getByUserId(user.id));
    }
  }, [dispatch, user, office]);

  useEffect(() => {
    if (office?.id && user?.id) {
      console.log('Office and user available, fetching vehicles...');
      fetchVehicles(1);
    }
  }, [office?.id, user?.id]);

  useEffect(() => {
    if (office?.id && user?.id) {
      setCurrentPage(1);
      fetchVehicles(1);
    }
  }, [searchText, filterType, filterStatus, filterOffice, sort, dateRange]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
      <VehicleStatusCards statusCounts={statusCounts} />

      <SearchFilters
        searchText={searchText}
        filterType={filterType}
        filterStatus={filterStatus}
        sort={sort}
        dateRange={dateRange}
        hover={hover}
        statuses={statuses}
        types={types}
        onSearchChange={setSearchText}
        onFilterChange={handleFilterChange}
        onSortChange={setSort}
        onDateRangeChange={setDateRange}
        onClearFilters={handleClearFilters}
        onHoverChange={setHover}
      />

      <Actions
        onAddVehicle={() => {
          setIsModalOpen(true);
          setModalMode('create');
          setSelectedVehicle({});
          form.resetFields();
        }}
        onImportExcel={handleExcelUpload}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <VehicleTable
        data={vehicles}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onEdit={(vehicle) => {
          setModalMode('edit');
          setSelectedVehicle(vehicle);
          setIsModalOpen(true);
          form.setFieldsValue(vehicle);
        }}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size) setPageSize(size);
          fetchVehicles(page);
        }}
      />

      <AddOrEditModal
        open={isModalOpen}
        mode={modalMode}
        vehicle={selectedVehicle}
        onOk={modalMode === 'edit' ? handleEditVehicle : handleAddVehicle}
        onCancel={() => setIsModalOpen(false)}
        onVehicleChange={setSelectedVehicle}
        form={form}
        statuses={statuses}
        types={types}
      />

      <ImportResults
        open={importModalOpen}
        importResults={importResults || []}
        totalImported={totalImported}
        totalFailed={totalFailed}
        onClose={() => setImportModalOpen(false)}
      />
    </div>
  );
};

export default Vehicles;