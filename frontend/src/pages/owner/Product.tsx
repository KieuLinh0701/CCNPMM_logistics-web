import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Upload,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Form,
  InputNumber,
} from "antd";
import {
  CloseCircleOutlined,
  EditOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  addProduct,
  getProductsByUser,
  getStatusesEnum,
  getTypesEnum,
  importProducts,
  updateProduct,
  // addProduct,
  // updateProduct,
  // importProducts,
  // getProductTypes,
} from "../../store/productSlice";
import { product } from "../../types/product";

interface ProductTable extends product {
  key: string;
}

const ProductForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [newProduct, setNewProduct] = useState<Partial<product>>({});
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sort, setSort] = useState("none");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hover, setHover] = useState(false);
  const [form] = Form.useForm();

  const dispatch = useAppDispatch();
  const { products = [], total = 0, types = [], statuses = [] } = useAppSelector((state) => state.product);

  // Chuẩn bị dữ liệu cho bảng
  const tableData: ProductTable[] = products.map((p, index) => ({
    ...p,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  // Thêm sản phẩm
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.type || !newProduct.weight) {
      message.error("Vui lòng nhập đầy đủ thông tin sản phẩm!");
      return;
    }
    try {
      console.log("new Product: <<<", newProduct);
      await dispatch(addProduct(newProduct));
      message.success("Thêm sản phẩm thành công!");
      setIsModalOpen(false);
      setNewProduct({});
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi khi thêm sản phẩm!");
    }
  };

  // Sửa sản phẩm
  const handleEditProduct = async () => {
    if (!newProduct.name || !newProduct.type || !newProduct.weight) {
      message.error("Vui lòng nhập đầy đủ thông tin sản phẩm!");
      return;
    }
    try {
      await dispatch(updateProduct({ product: newProduct }));
      message.success("Cập nhật sản phẩm thành công!");
      setIsModalOpen(false);
      setNewProduct({});
      form.resetFields();
    } catch (error) {
      message.error("Cập nhật thất bại!");
    }
  };

  // Upload Excel
  const handleExcelUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Chỉ lấy các trường cần thiết
        const newProducts: Partial<product>[] = rows.map((row) => ({
          name: row["Tên sản phẩm"]?.trim() || "",
          weight: row["Trọng lượng (kg)"] ?? 0,
          type: row["Loại"]?.trim() || "",
          status: row["Trạng thái"]?.trim() || "Active",
        }));

        // Kiểm tra dữ liệu rỗng
        if (newProducts.length === 0) {
          message.error("Không tìm thấy dữ liệu sản phẩm trong file Excel!");
          return;
        }

        // Kiểm tra xem có sản phẩm nào thiếu thông tin bắt buộc
        const invalidRows = newProducts.filter(
          (p) => !p.name || !p.type || !p.weight
        );
        if (invalidRows.length > 0) {
          message.error("Có dòng bị thiếu tên, loại hoặc trọng lượng sản phẩm. Vui lòng kiểm tra lại file!");
          return;
        }

        // Gửi lên API 
        const resultAction = await dispatch(importProducts({ products: newProducts })).unwrap();
        if (resultAction?.success) {
          message.success("Import sản phẩm thành công!");
          setImportResults(resultAction.results ?? []);
          setImportModalOpen(true);

          setCurrentPage(1);
          dispatch(getProductsByUser({ page: currentPage, limit: pageSize }));
        } else {
          message.error(resultAction?.message || "Import thất bại");
        }

        console.log("Products đã parse từ Excel:", newProducts);
        message.success(`Đã đọc ${newProducts.length} sản phẩm từ file Excel!`);
      } catch (err: any) {
        message.error("Có lỗi khi đọc file Excel!");
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
        "Loại": types[0] ?? "Đồ uống",
        "Trạng thái": "Active",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const header = ["Tên sản phẩm", "Trọng lượng (kg)", "Loại", "Trạng thái"];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 0 });

    ws["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "product_template.xlsx");
  };

  const statusTag = (status: string) => {
    switch (status) {
      case "Active":
        return <Tag color="green">{status}</Tag>;
      case "Inactive":
        return <Tag color="red">{status}</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  const fetchProducts = (page = currentPage, search?: string) => {
    const payload: any = {
      page,
      limit: pageSize,
      searchText: search !== undefined ? search : searchText,
      type: filterType !== "All" ? filterType : undefined,
      status: filterStatus !== "All" ? filterStatus : undefined,
      sort: sort !== "none" ? sort : undefined,
    };

    if (dateRange) {
      payload.startDate = dateRange[0].startOf("day").toISOString();
      payload.endDate = dateRange[1].endOf("day").toISOString();
    }

    dispatch(getProductsByUser(payload));
  };

  const columns: ColumnsType<ProductTable> = [
    { title: "Mã SP", dataIndex: "id", key: "id", align: "center" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", align: "center" },
    { title: "Trọng lượng (kg)", dataIndex: "weight", key: "weight", align: "center" },
    { title: "Loại", dataIndex: "type", key: "type", align: "center" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", align: "center", render: (date) => dayjs(date).format("YYYY-MM-DD") },
    { title: "Tổng bán", dataIndex: "totalSold", key: "totalSold", align: "center" },
    { title: "Trạng thái", dataIndex: "status", key: "status", align: "center", render: (status) => statusTag(status) },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record: ProductTable) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setModalMode("edit");
              setNewProduct(record);
              setIsModalOpen(true);
              form.setFieldsValue(record);
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    dispatch(getProductsByUser({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    dispatch(getTypesEnum());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getStatusesEnum());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
    console.log("searchText", searchText);
  }, [searchText, filterType, filterStatus, sort, dateRange]);

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 40 }}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              placeholder="Tìm theo tên sản phẩm"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => {
                const val = e.target.value;
                setSearchText(val);
                setCurrentPage(1);
                fetchProducts(1, val); 
              }}
              allowClear
            />
            <Select value={filterType} onChange={(val) => setFilterType(val)} style={{ width: 150, height: 36 }}>
              <Select.Option value="All">Tất cả loại</Select.Option>
              {types.map((t) => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
            <Select value={filterStatus} onChange={(val) => setFilterStatus(val)} style={{ width: 150, height: 36 }}>
              <Select.Option value="All">Tất cả trạng thái</Select.Option>
              {statuses.map((s) => (
                <Select.Option key={s} value={s}>
                  {s}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(val) => {
                setSort(val);
                setCurrentPage(1);
              }}
              style={{ width: 180, height: 36 }}
            >
              <Select.Option value="none">Không sắp xếp</Select.Option>
              <Select.Option value="bestSelling">Bán chạy nhất</Select.Option>
              <Select.Option value="leastSelling">Bán ít nhất</Select.Option>
            </Select>
            <DatePicker.RangePicker style={{ width: 300, height: 36 }} onChange={(val) => setDateRange(val as any)} />
            <Button
              type="default"
              icon={<CloseCircleOutlined />}
              onClick={() => {
                setSearchText("");
                setFilterType("All");
                setFilterStatus("All");
                setSort("none");
                setDateRange(null);
                setCurrentPage(1);
              }}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                height: 36,
                borderRadius: 8,
                transition: "width 0.2s",
                width: hover ? 110 : 36,
              }}
            >
              {hover && "Bỏ lọc"}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Các nút thao tác */}
      <Row justify="end" style={{ marginBottom: 25 }}>
        <Space>
          <Button
            type="primary"
            style={{ backgroundColor: "#1976D2", borderColor: "#1976D2", height: 36, borderRadius: 8 }}
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
              setModalMode("create");
              setNewProduct({});
              form.resetFields();
            }}
          >
            Thêm sản phẩm
          </Button>
          <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
            <Button style={{ backgroundColor: "#43A047", color: "#fff" }} icon={<UploadOutlined />}>
              Nhập từ Excel
            </Button>
          </Upload>
          <Button style={{ backgroundColor: "#FB8C00", color: "#fff" }} icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            File mẫu
          </Button>
        </Space>
      </Row>

      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px" }}>
        Kết quả trả về: {total} sản phẩm
      </Tag>

      {/* Bảng */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        pagination={{
          current: currentPage,
          pageSize,
          total,
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size) setPageSize(size);
            fetchProducts(page);
          },
        }}
        style={{
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      />

      {/* Modal thêm/sửa */}
      <Modal
        title={
          <span
            style={{
              color: "#1C3D90",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {modalMode === "edit" ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </span>
        }
        open={isModalOpen}
        onOk={modalMode === "edit" ? handleEditProduct : handleAddProduct}
        onCancel={() => setIsModalOpen(false)}
        okText={modalMode === "edit" ? "Cập nhật" : "Thêm"}
        okButtonProps={{
          style: {
            backgroundColor: "#1C3D90",
            borderRadius: "8px",
            color: "#fff",
          },
        }}
        cancelButtonProps={{
          style: {
            border: "1px solid #1C3D90",
            borderRadius: "8px",
            color: "#1C3D90",
          },
        }}
        cancelText="Hủy"
        bodyStyle={{
          maxHeight: "65vh",
          overflowY: "auto",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Mã NV" name="id" style={{ marginBottom: 12 }}>
            <Input value={newProduct.id} disabled />
          </Form.Item>

          <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Nhập tên sản phẩm!" }]}>
            <Input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Trọng lượng (kg)" name="weight">
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={newProduct.weight}
              onChange={(val) => setNewProduct({ ...newProduct, weight: val ?? 0 })}
            />
          </Form.Item>
          <Form.Item label="Loại" name="type">
            <Select
              value={newProduct.type}
              onChange={(val) => setNewProduct({ ...newProduct, type: val })}
              placeholder="Chọn loại..."
            >
              {types.map((t) => (
                <Select.Option key={t} value={t}>
                  {t}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Trạng thái" name="status">
            <Select
              value={newProduct.status}
              onChange={(val) => setNewProduct({ ...newProduct, status: val as any })}
            >
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal kết quả import */}
      <Modal
        title="Kết quả Import sản phẩm"
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={<Button onClick={() => setImportModalOpen(false)}>Đóng</Button>}
        width={800}
        centered
      >
        <Table
          dataSource={importResults.map((r, i) => ({
            key: i,
            name: r.name || "Không có tên",
            success: r.success ?? false,
            message: r.message || "",
          }))}
          columns={[
            { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
            {
              title: "Trạng thái",
              dataIndex: "success",
              key: "success",
              render: (success: boolean) =>
                success ? <Tag color="green">Thành công</Tag> : <Tag color="red">Thất bại</Tag>,
            },
            { title: "Message", dataIndex: "message", key: "message" },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ProductForm;