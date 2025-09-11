import React, { useState } from "react";
import { CSSProperties } from "react";
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
  Typography,
  Tag,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";

const { Title } = Typography;

interface Order {
  key: string;
  code: string;
  type: "Import" | "Export";
  status: string;
  date: string;
}

const Warehouse = () => {
  const [orders, setOrders] = useState<Order[]>([
    { key: "1", code: "DH001", type: "Import", status: "Hoàn tất", date: "2025-09-05" },
    { key: "2", code: "DH002", type: "Export", status: "Đang xử lý", date: "2025-09-07" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderCode, setOrderCode] = useState("");
  const [orderType, setOrderType] = useState<"Import" | "Export">("Import");

  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Import" | "Export">("All");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const handleDelete = (key: string) => {
    setOrders((prev) => prev.filter((order) => order.key !== key));
    message.success("Xóa đơn hàng thành công!");
  };

  const handleEdit = (record: Order) => {
    message.info(`Sửa đơn hàng: ${record.code}`);
  };

  const handleAddOrder = () => {
    if (!orderCode) {
      message.error("Vui lòng nhập mã đơn hàng!");
      return;
    }
    setOrders((prev) => [
      ...prev,
      {
        key: String(prev.length + 1),
        code: orderCode,
        type: orderType,
        status: "Mới",
        date: dayjs().format("YYYY-MM-DD"),
      },
    ]);
    setOrderCode("");
    setOrderType("Import");
    setIsModalOpen(false);
    message.success("Thêm đơn hàng thành công!");
  };

  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      const newOrders: Order[] = rows.map((row, index) => ({
        key: String(orders.length + index + 1),
        code: row["Mã đơn hàng"] || `UNK${index}`,
        type: row["Loại"] === "Export" ? "Export" : "Import",
        status: row["Trạng thái"] || "Mới",
        date: row["Ngày"] || dayjs().format("YYYY-MM-DD"),
      }));

      setOrders((prev) => [...prev, ...newOrders]);
      message.success(`Nhập thành công ${newOrders.length} đơn từ Excel!`);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { "Mã đơn hàng": "DHxxx", "Loại": "Import/Export", "Trạng thái": "Mới/Hoàn tất", "Ngày": "YYYY-MM-DD" },
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "warehouse_template.xlsx");
  };

  const filteredOrders = orders.filter((order) => {
    const matchCode = order.code.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === "All" || order.type === filterType;
    const matchDate =
      !dateRange ||
      (dayjs(order.date).isAfter(dateRange[0].startOf("day")) &&
        dayjs(order.date).isBefore(dateRange[1].endOf("day")));
    return matchCode && matchType && matchDate;
  });

  const statusTag = (status: string) => {
    switch (status) {
      case "Hoàn tất":
        return <Tag color="green">{status}</Tag>;
      case "Đang xử lý":
        return <Tag color="orange">{status}</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  const columns: ColumnsType<Order> = [
    { 
      title: "Mã đơn hàng", 
      dataIndex: "code", 
      key: "code", 
      width: 150,
      onHeaderCell: () => ({
        style: { textAlign: "center" as CSSProperties["textAlign"] }
      }),
      onCell: () => ({ style: { textAlign: "center" as CSSProperties["textAlign"] } })
    },
    { 
      title: "Loại", 
      dataIndex: "type", 
      key: "type", 
      width: 100,
      onHeaderCell: () => ({
        style: { textAlign: "center" as CSSProperties["textAlign"] }
      }),
      onCell: () => ({ style: { textAlign: "center" as CSSProperties["textAlign"] } })
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: string) => statusTag(status),
      onHeaderCell: () => ({
        style: { textAlign: "center" as CSSProperties["textAlign"] }
      }),
      onCell: () => ({ style: { textAlign: "center" as CSSProperties["textAlign"] } }),
    },
    { 
      title: "Ngày", 
      dataIndex: "date", 
      key: "date", 
      width: 160,
      onHeaderCell: () => ({
        style: { textAlign: "center" as CSSProperties["textAlign"] }
      }),
      onCell: () => ({ style: { textAlign: "center" as CSSProperties["textAlign"] } })
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_: any, record: Order) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.key)}>
            Xóa
          </Button>
        </Space>
      ),
      onHeaderCell: () => ({
        style: {textAlign: "center" as CSSProperties["textAlign"] }
      }),
      onCell: () => ({ style: { textAlign: "center" as CSSProperties["textAlign"] } })
    },
  ];

  return (
    <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 12 }}>
      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 40 }}>
        <Col span={24}>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <Input
              placeholder="Tìm kiếm theo mã đơn"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ flex: 1, height: 36, borderRadius: 8 }}
            />
            <Select
              value={filterType}
              onChange={(val) => setFilterType(val)}
              style={{ width: 200, height: 36, borderRadius: 8 }}
            >
              <Select.Option value="All">Tất cả</Select.Option>
              <Select.Option value="Import">Import</Select.Option>
              <Select.Option value="Export">Export</Select.Option>
            </Select>
            <DatePicker.RangePicker
              style={{ width: 300, height: 36, borderRadius: 8 }}
              onChange={(val) => setDateRange(val as any)}
            />
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
            onClick={() => setIsModalOpen(true)}
          >
            Nhập từng đơn
          </Button>

          <Upload beforeUpload={handleExcelUpload} showUploadList={false}>
            <Button
              style={{ backgroundColor: "#43A047", borderColor: "#43A047", color: "#fff", height: 36, borderRadius: 8 }}
              icon={<UploadOutlined />}
            >
              Nhập từ Excel
            </Button>
          </Upload>

          <Button
            style={{ backgroundColor: "#FB8C00", borderColor: "#FB8C00", color: "#fff", height: 36, borderRadius: 8 }}
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
          >
            Tải form mẫu
          </Button>
        </Space>
      </Row>

      {/* Bảng */}
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="key"
        bordered
        pagination={{ pageSize: 5 }}
        style={{ borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      />

      {/* Modal */}
      <Modal
        title="Nhập đơn hàng mới"
        open={isModalOpen}
        onOk={handleAddOrder}
        onCancel={() => setIsModalOpen(false)}
        okText="Thêm"
        cancelText="Hủy"
        style={{ borderRadius: 12 }}
      >
        <Input
          placeholder="Nhập mã đơn hàng (VD: DH003)"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          style={{ marginBottom: 12, borderRadius: 8 }}
        />
        <Select value={orderType} onChange={(value) => setOrderType(value)} style={{ width: "100%", borderRadius: 8 }}>
          <Select.Option value="Import">Import</Select.Option>
          <Select.Option value="Export">Export</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default Warehouse;