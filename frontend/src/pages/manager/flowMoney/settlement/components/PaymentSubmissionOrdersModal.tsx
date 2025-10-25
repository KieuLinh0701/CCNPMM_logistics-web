import React from "react";
import { Table, Modal, message, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Order } from "../../../../../types/order";
import { translateOrderStatus } from "../../../../../utils/orderUtils";

interface PaymentSubmissionOrdersModalProps {
  visible: boolean;
  loading: boolean;
  orders: Order[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
  role: string;
}

const PaymentSubmissionOrdersModal: React.FC<PaymentSubmissionOrdersModalProps> = ({
  visible,
  loading,
  orders,
  page,
  limit,
  total,
  onPageChange,
  onClose,
  role
}) => {
  const navigate = useNavigate();

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn hàng",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      align: "center",
      render: (value: string, record: Order) => (
        <a
          onClick={() =>
            navigate(`/${role}/orders/detail/${record.trackingNumber}`)
          }
        >
          {value}
        </a>
      ),
    },
    {
      title: "COD (VNĐ)",
      dataIndex: "cod",
      key: "cod",
      align: "center",
      render: (value: number) => (value ? value.toLocaleString("vi-VN") : "0"),
    },
    {
      title: "Giá trị đơn hàng (VNĐ)",
      dataIndex: "orderValue",
      key: "orderValue",
      align: "center",
      render: (value: number) => (value ? value.toLocaleString("vi-VN") : "0"),
    },
    {
      title: "Phí dịch vụ",
      dataIndex: "totalFee",
      key: "totalFee",
      align: "center",
      render: (value: number) => (value ? value.toLocaleString("vi-VN") : "0"),
    },
    {
      title: "Ngày giao",
      dataIndex: "deliveredAt",
      key: "deliveredAt",
      align: "center",
      render: (date?: Date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : <Tag color="default">N/A</Tag>,
    },
  ];

  return (
    <Modal
      centered={true}
      title={
        <span style={{ fontSize: 18, color: "#1C3D90", fontWeight: 600 }}>
          Danh sách đơn hàng
        </span>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      <Tag color="blue" style={{ fontSize: 14, padding: "4px 8px", marginTop: 16 }}>Kết quả trả về: {total} đơn hàng</Tag>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: onPageChange,
        }}
      />
    </Modal>
  );
};

export default PaymentSubmissionOrdersModal;
