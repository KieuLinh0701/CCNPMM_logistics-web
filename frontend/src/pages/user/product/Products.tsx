import React, { useEffect, useState } from 'react';
import * as XLSX from "xlsx";
import { Form, message } from 'antd';
import dayjs from 'dayjs';
import { product } from '../../../types/product';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { createProduct, listUserProducts, getProductStatuses, getProductTypes, importProducts, updateProduct } from '../../../store/productSlice';
import SearchFilters from './components/SearchFilters';
import Actions from './components/Actions';
import ProductTable from './components/Table';
import AddEditModal from './components/AddEditModal';
import ImportResults from './components/ImportResults';

const Products: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [newProduct, setNewProduct] = useState<Partial<product>>({});
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sort, setSort] = useState('newest');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hover, setHover] = useState(false);
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { products = [], total = 0, types = [], statuses = [] } = useAppSelector((state) => state.product);

  // Handlers
  const handleAddProduct = async () => {
    await form.validateFields();
    try {
      const result = await dispatch(createProduct(newProduct)).unwrap();

      const successMessage = result?.message || 'Thêm sản phẩm thành công!';
      if (result.success) {
        message.success(successMessage);
      } else {
        message.error(successMessage);
      }

      setIsModalOpen(false);
      setNewProduct({});
      form.resetFields();
      fetchProducts(1);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi thêm sản phẩm!';
      message.error(errorMessage);
    }
  };

  const handleEditProduct = async () => {
    await form.validateFields();
    try {
      const result = await dispatch(updateProduct({ product: newProduct })).unwrap();

      const successMessage = result?.message || 'Sửa sản phẩm thành công!';
      if (result.success) {
        message.success(successMessage);
      } else {
        message.error(successMessage);
      }

      setIsModalOpen(false);
      setNewProduct({});
      form.resetFields();
      fetchProducts(1);
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Có lỗi khi sửa sản phẩm!';
      message.error(errorMessage);
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

        console.log("Dữ liệu thô từ Excel:", rows);

        const newProducts: Partial<product>[] = rows.map((row, index) => {
          console.log(`Dòng ${index + 1}:`, row); // Debug từng dòng

          return {
            name: row["Tên sản phẩm"]?.toString().trim() || "",
            weight: parseFloat(row["Trọng lượng (kg)"]) || 0,
            price: parseInt(row["Giá sản phẩm (VNĐ)"]) || 0,
            type: row["Loại"]?.toString().trim() || "",
            status: (row["Trạng thái"]?.toString().trim() || "Active") as "Active" | "Inactive",
            stock: parseInt(row["Tồn kho"]) || 0,
          };
        });

        console.log("Sản phẩm đã parse:", newProducts);

        // Kiểm tra dữ liệu rỗng
        if (newProducts.length === 0) {
          message.error("Không tìm thấy dữ liệu sản phẩm trong file Excel!");
          return;
        }

        // Kiểm tra xem có sản phẩm nào thiếu thông tin bắt buộc
        const invalidRows = newProducts.filter(
          (p) => !p.name || !p.type || p.weight === undefined || p.price === undefined
        );

        if (invalidRows.length > 0) {
          message.error(`Có ${invalidRows.length} dòng bị thiếu thông tin bắt buộc. Vui lòng kiểm tra lại file!`);
          console.log("Các dòng lỗi:", invalidRows);
          return;
        }

        // Gửi lên API 
        const resultAction = await dispatch(importProducts({ products: newProducts })).unwrap();
        console.log("resultAction", resultAction);

        // Nếu backend trả về success: true
        if (resultAction?.success) {
          // Lấy message từ backend
          message.success(resultAction?.message || "Import sản phẩm thành công!");

          // Lưu kết quả chi tiết để hiển thị
          setImportResults(resultAction.results ?? []);
          setImportModalOpen(true);
          setCurrentPage(1);

          // Cập nhật lại danh sách sản phẩm
          dispatch(listUserProducts({ page: currentPage, limit: pageSize }));
        } else {
          // Nếu backend trả về success: false
          message.error(resultAction?.message || "Import thất bại");
        }

      } catch (err: any) {
        console.error("Chi tiết lỗi đọc Excel:", err);
        message.error(`Có lỗi khi đọc file Excel: ${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  // Download template
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    const data = [
      {
        "Tên sản phẩm": "Áo tay dài",
        "Trọng lượng (kg)": 0.5,
        "Giá sản phẩm (VNĐ)": 200000,
        "Loại": "Fresh / Letter / Goods",
        "Trạng thái": "Active / Inactive",
        "Tồn kho": "10",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);

    const header = ["Tên sản phẩm", "Trọng lượng (kg)", "Giá sản phẩm (VNĐ)", "Loại", "Trạng thái", "Tồn kho"];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: "A1" });

    ws["!cols"] = [
      { wch: 25 }, // Tên sản phẩm
      { wch: 15 }, // Trọng lượng
      { wch: 20 }, // Giá sản phẩm
      { wch: 20 }, // Loại
      { wch: 15 }, // Trạng thái
      { wch: 12 }, // Tồn kho
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "product_template.xlsx");
  };

  const fetchProducts = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      searchText: search !== undefined ? search : searchText,
      type: filterType !== 'All' ? filterType : undefined,
      status: filterStatus !== 'All' ? filterStatus : undefined,
      sort: sort !== 'newest' ? sort : undefined,
      stock: stockFilter != 'All' ? stockFilter : undefined,
    };

    if (dateRange) {
      payload.startDate = dateRange[0].startOf('day').toISOString();
      payload.endDate = dateRange[1].endOf('day').toISOString();
    }

    dispatch(listUserProducts(payload));
  };

  const handleFilterChange = (filter: string, value: string) => {
    switch (filter) {
      case 'type':
        setFilterType(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'stock':
        setStockFilter(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterType('All');
    setFilterStatus('All');
    setSort('newest');
    setDateRange(null);
    setCurrentPage(1);
    setStockFilter('All');
  };

  // Effects
  useEffect(() => {
    dispatch(listUserProducts({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    dispatch(getProductTypes());
    dispatch(getProductStatuses());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [searchText, filterType, filterStatus, sort, dateRange, stockFilter]);

  return (
    <div style={{ padding: 24, background: '#F9FAFB', borderRadius: 12 }}>
      <SearchFilters
        searchText={searchText}
        filterType={filterType}
        filterStatus={filterStatus}
        stockFilter={stockFilter}
        sort={sort}
        dateRange={dateRange}
        hover={hover}
        types={types}
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
        onAddProduct={() => {
          setIsModalOpen(true);
          setModalMode('create');
          setNewProduct({});
          form.resetFields();
        }}
        onImportExcel={handleExcelUpload}
        onDownloadTemplate={handleDownloadTemplate}
      />

      <ProductTable
        data={products}
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onEdit={(product) => {
          setModalMode('edit');
          setNewProduct(product);
          setIsModalOpen(true);
          form.setFieldsValue(product);
        }}
        onPageChange={(page, size) => {
          setCurrentPage(page);
          if (size) setPageSize(size);
          fetchProducts(page);
        }}
      />

      <AddEditModal
        open={isModalOpen}
        mode={modalMode}
        product={newProduct}
        types={types}
        onOk={modalMode === 'edit' ? handleEditProduct : handleAddProduct}
        onCancel={() => setIsModalOpen(false)}
        onProductChange={setNewProduct}
        form={form}
      />

      <ImportResults
        open={importModalOpen}
        results={importResults}
        onClose={() => setImportModalOpen(false)}
      />
    </div>
  );
};

export default Products;