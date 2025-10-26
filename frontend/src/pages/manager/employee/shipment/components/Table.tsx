import React from "react";
import { Table, Button, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Data } from "../../../../../types/employee";
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { translateShipmentStatus } from "../../../../../utils/shipmentUtils";
import { Shipment } from "../../../../../types/shipment";

interface Props {
  shipments: Shipment[];
  onDetail: (employeeId: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

const ShipmentTable: React.FC<Props> = ({ 
  shipments, 
  onDetail,
  currentPage,
  pageSize,
  total,
  onPageChange,
}) => {

  const statusTag = (status: string) => {
    switch (status) {
      case "Pending": return <Tag color="default">{translateShipmentStatus(status)}</Tag>;
      case "InTransit": return <Tag color="orange">{translateShipmentStatus(status)}</Tag>;
      case "Completed": return <Tag color="blue">{translateShipmentStatus(status)}</Tag>;
      case "Cancelled": return <Tag color="purple">{translateShipmentStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const tableData = shipments.map((o) => ({ ...o, key: String(o.id) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã chuyến",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => status ? statusTag(status) : <Tag color="default">N/A</Tag>,
    },
    {
      title: "Biển số phương tiện",
      dataIndex: "vehicle",
      key: "licensePlate",
      align: "center",
      render: (vehicle) => vehicle && vehicle.licensePlate ? vehicle.licensePlate : <Tag color="default">N/A</Tag>,
    },
    {
      title: "Tải trọng xe (kg)",
      dataIndex: "vehicle",
      key: "capacity",
      align: "center",
      render: (vehicle) => {
        if (!vehicle || !vehicle.capacity) return <Tag color="default">N/A</Tag>;
        const num = Number(vehicle.capacity);
        return isNaN(num) ? <Tag color="default">N/A</Tag> : num.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
    },
    {
      title: "Tổng số đơn",
      dataIndex: "orderCount",
      key: "orderCount",
      align: "center",
      render: (value: any) => (typeof value === "number" ? value.toLocaleString("vi-VN") : "0"),
    },
    {
      title: "Tổng trọng lượng (kg)",
      dataIndex: "totalWeight",
      key: "totalWeight",
      align: "center",
      render: (value: any) => {
        const num = Number(value);
        return !isNaN(num) ? num.toFixed(2) : "0.00";
      },
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startTime",
      key: "startTime",
      align: "center",
      render: (value: string | number) => value ? dayjs(value).locale('vi').format('DD/MM/YYYY HH:mm') : <Tag color="default">N/A</Tag>,
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      align: "center",
      render: (value: string | number) => value ? dayjs(value).locale('vi').format('DD/MM/YYYY HH:mm') : <Tag color="default">N/A</Tag>,
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_: any, record: Shipment) => {
        return (
          <Button
            type="link"
            size="small"
            onClick={() => onDetail(record.id)}
          >
            DS đơn hàng
          </Button>
        );
      }
    },
  ];

  return <Table
    columns={columns}
    dataSource={tableData}
    rowKey="key"
    scroll={{ x: "max-content" }}
    pagination={{
      current: currentPage,
      pageSize,
      total,
      onChange: onPageChange,
    }}
    style={{ borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />;
};

export default ShipmentTable;