import React from "react";
import dayjs from 'dayjs';
import { Table, Button, Space, Tag, Tooltip, message } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined, CopyOutlined, CarryOutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Order } from "../../../../../types/order";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus, translateOrderStatus } from "../../../../../utils/orderUtils";

interface Props {
  orders: Order[];
  provinceList: { code: number; name: string }[];
  wardList: { code: number; name: string }[];
  onCancel: (id: number) => void;
  role: string;
}

const OrderTable: React.FC<Props> = ({ orders, provinceList, wardList, onCancel, role }) => {
  const navigate = useNavigate();

  const statusTag = (status: string) => {
    switch (status) {
      case "draft": return <Tag color="default">{translateOrderStatus(status)}</Tag>;
      case "pending": return <Tag color="orange">{translateOrderStatus(status)}</Tag>;
      case "confirmed": return <Tag color="blue">{translateOrderStatus(status)}</Tag>;
      case "picked_up": return <Tag color="purple">{translateOrderStatus(status)}</Tag>;
      case "in_transit": return <Tag color="cyan">{translateOrderStatus(status)}</Tag>;
      case "delivering": return <Tag color="lime">{translateOrderStatus(status)}</Tag>;
      case "delivered": return <Tag color="green">{translateOrderStatus(status)}</Tag>;
      case "cancelled": return <Tag color="red">{translateOrderStatus(status)}</Tag>;
      case "returning": return <Tag color="yellow">{translateOrderStatus(status)}</Tag>;
      case "returned": return <Tag color="gold">{translateOrderStatus(status)}</Tag>;
      case "Paid": return <Tag color="green">{translateOrderPaymentStatus(status)}</Tag>;
      case "Unpaid": return <Tag color="red">{translateOrderPaymentStatus(status)}</Tag>;
      case "Refunded": return <Tag color="orange">{translateOrderPaymentStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const tableData = orders.map((o) => ({ ...o, key: String(o.id) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã đơn",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      align: "center",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => navigate(`/${role}/orders/detail/${record.trackingNumber}`)}
            style={{ padding: 0 }}
          >
            {record.trackingNumber}
          </Button>
          <Tooltip title="Copy mã đơn hàng">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(text);
                message.success('Đã copy mã đơn hàng!');
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
        </Space>
      ),
    },
    { title: "Tên người nhận", dataIndex: "recipientName", key: "recipientName", align: "center" },
    { title: "SĐT người nhận", dataIndex: "recipientPhone", key: "recipientPhone", align: "center" },
    {
      title: "Địa chỉ người nhận",
      key: "recipientAddress",
      align: "center",
      width: 300,
      render: (_, record) => {
        const cityName = provinceList.find((p) => p.code === Number(record.recipientCityCode))?.name || "";
        const wardName = wardList.find((w) => w.code === Number(record.recipientWardCode))?.name || "";
        const address = `${record.recipientDetailAddress || ""}, ${wardName}, ${cityName}`;

        return (
          <div style={{
            maxWidth: "300px",
            wordBreak: "break-word",
            whiteSpace: "normal"
          }}>
            {address}
          </div>
        );
      },
    },
    { title: "Phí dịch vụ (VNĐ)", dataIndex: "totalFee", key: "totalFee", align: "center" },
    { title: "Gía trị đơn (VNĐ)", dataIndex: "orderValue", key: "orderValue", align: "center" },
    { title: "COD (VNĐ)", dataIndex: "cod", key: "cod", align: "center" },
    { title: "Khối lượng (Kg)", dataIndex: "weight", key: "weight", align: "center" },
    {
      title: "Người thanh toán",
      dataIndex: "payer",
      key: "payer",
      align: "center",
      render: (payer) => (
        translateOrderPayer(payer)
      )
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      render: (method) => (
        translateOrderPaymentMethod(method)
      )
    },
    { title: "Trạng thái thanh toán", dataIndex: "paymentStatus", key: "paymentStatus", align: "center", render: (p) => statusTag(p) },
    { title: "Trạng thái", dataIndex: "status", key: "status", align: "center", render: (s) => statusTag(s) },
    {
      title: "Bưu cục gửi",
      dataIndex: "fromOffice",
      key: "fromOffice",
      align: "center",
      render: (fromOffice) => {
        return fromOffice?.name || "---";
      }
    },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", align: "center", render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss') },
    {
      title: "Ngày hoàn thành",
      dataIndex: "deliveredAt",
      key: "deliveredAt",
      align: "center",
      render: (date) =>
        date
          ? dayjs(date).format("DD/MM/YYYY HH:mm:ss")
          : "---",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const canCancel = ["draft", "pending", "confirmed"].includes(record.status) && record.createdByType === "user";
        const canEdit = ["draft", "pending", "confirmed"].includes(record.status);
        return (
          <Space>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/${role}/orders/detail/${record.trackingNumber}`)}
            >
              Xem
            </Button>

            <Button
              type="link"
              icon={<EditOutlined />}
              disabled={!canEdit}
              onClick={() => canEdit && navigate(`/${role}/orders/edit/${record.trackingNumber}`)}
            >
              Sửa
            </Button>

            <Button
              type="link"
              icon={<CloseCircleOutlined />}
              disabled={!canCancel}
              onClick={() => canCancel && record.id && onCancel(record.id)}
            >
              Hủy
            </Button>
          </Space>
        );
      },
    },
  ];

  return <Table
    columns={columns}
    dataSource={tableData}
    rowKey="key"
    scroll={{ x: "max-content" }}
    style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }} />;
};

export default OrderTable;