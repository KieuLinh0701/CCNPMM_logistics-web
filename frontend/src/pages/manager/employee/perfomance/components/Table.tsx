import React from "react";
import { Table, Button, Space, Tag, message, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined, CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus, translateOrderStatus } from "../../../../../utils/orderUtils";
import dayjs from "dayjs";
import { Order } from "../../../../../types/order";
import { Data } from "../../../../../types/employee";

interface Props {
  data: Data[];
  onDetail: (employeeId: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

const EmployeeTable: React.FC<Props> = ({
  data,
  onDetail,
  currentPage,
  pageSize,
  total,
  onPageChange,
}) => {

  const tableData = data.map((o) => ({ ...o, key: String(o.employeeId) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã nhân viên",
      dataIndex: "employeeId",
      key: "employeeId",
      align: "center",
    },
    {
      title: "Tên nhân viên",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      align: "center",
    },
    {
      title: "Tổng số chuyến giao",
      dataIndex: "totalShipments",
      key: "totalShipments",
      align: "center",
      render: (value: number) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Tổng số đơn giao",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center",
      render: (value: number) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Số đơn giao thành công",
      dataIndex: "completedOrders",
      key: "completedOrders",
      align: "center",
      render: (value: number) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Tỉ lệ đơn thành công (%)",
      dataIndex: "completionRate",
      key: "completionRate",
      align: "center",
      render: (value: number) => value.toFixed(2),
    },
    {
      title: "Thời gian trung bình/đơn (phút)",
      dataIndex: "avgTimePerOrder",
      key: "avgTimePerOrder",
      align: "center",
      render: (value: number) => value.toFixed(2),
    },
    {
      title: "",
      key: "action",
      align: "center",
      render: (_: any, record: Data) => {
        return (
          <Button
            type="link"
            size="small"
            onClick={() => onDetail(record.employeeId)}
          >
            DS chuyến đi
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
    style={{ borderRadius: 12, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
    pagination={{
      current: currentPage,
      pageSize,
      total,
      onChange: onPageChange,
    }}
  />;
};

export default EmployeeTable;