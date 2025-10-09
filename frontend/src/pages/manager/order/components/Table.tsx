import React from "react";
import { Table, Button, Space, Tag } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Order } from "../../../../types/order";

interface Props {
  orders: Order[];
  provinceList: { code: number; name: string }[];
  wardList: { code: number; name: string }[];
  role?: string;
  officeId?: number;
}

const OrderTable: React.FC<Props> = ({ orders, provinceList, wardList, role, officeId }) => {
  const navigate = useNavigate();

  const statusTag = (status: string) => {
    switch (status) {
      case "draft": return <Tag color="default">{status}</Tag>;
      case "pending": return <Tag color="orange">{status}</Tag>;
      case "confirmed": return <Tag color="blue">{status}</Tag>;
      case "picked_up": return <Tag color="purple">{status}</Tag>;
      case "in_transit": return <Tag color="cyan">{status}</Tag>;
      case "delivered": return <Tag color="green">{status}</Tag>;
      case "cancelled": return <Tag color="red">{status}</Tag>;
      case "Paid": return <Tag color="green">{status}</Tag>;
      case "Unpaid": return <Tag color="red">{status}</Tag>;
      case "Refunded": return <Tag color="orange">{status}</Tag>;
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
      render: (_, record) => <Button type="link" onClick={() => navigate(`/${role}/orders/detail/${record.id}`)}>{record.trackingNumber}</Button>,
    },
    { title: "Tên người gửi", dataIndex: "senderName", key: "senderName", align: "center" },
    { title: "SĐT người gửi", dataIndex: "senderPhone", key: "senderPhone", align: "center" },
    {
      title: "Địa chỉ người gửi",
      key: "senderAddress",
      align: "center",
      render: (_, record) => {
        const cityName = provinceList.find((p) => p.code === Number(record.recipientCityCode))?.name || "";
        const wardName = wardList.find((w) => w.code === Number(record.recipientWardCode))?.name || "";
        return `${record.recipientDetailAddress || ""}, ${wardName}, ${cityName}`;
      },
    },
    { title: "Tên người nhận", dataIndex: "recipientName", key: "recipientName", align: "center" },
    { title: "SĐT người nhận", dataIndex: "recipientPhone", key: "recipientPhone", align: "center" },
    {
      title: "Địa chỉ người nhận",
      key: "recipientAddress",
      align: "center",
      render: (_, record) => {
        const cityName = provinceList.find((p) => p.code === Number(record.senderCityCode))?.name || "";
        const wardName = wardList.find((w) => w.code === Number(record.senderWardCode))?.name || "";
        return `${record.senderDetailAddress || ""}, ${wardName}, ${cityName}`;
      },
    },
    { title: "Gía trị đơn", dataIndex: "orderValue", key: "orderValue", align: "center" },
    { title: "Phí vận chuyển", dataIndex: "shippingFee", key: "shippingFee", align: "center" },
    { title: "COD", dataIndex: "cod", key: "cod", align: "center" },
    { title: "Người thanh toán", dataIndex: "payer", key: "payer", align: "center" },
    { title: "Phương thức thanh toán", dataIndex: "paymentMethod", key: "paymentMethod", align: "center" },
    { title: "Trạng thái thanh toán", dataIndex: "paymentStatus", key: "paymentStatus", align: "center", render: (p) => statusTag(p) },
    {
      title: "Điểm gửi",
      dataIndex: "fromOffice",
      key: "fromOffice",
      align: "center",
      render: (fromOffice) => {
        if (!fromOffice) return "---";
        return fromOffice.id === officeId
          ? "Bưu cục hiện tại"
          : fromOffice.name
      }
    },

    {
      title: "Điểm nhận",
      dataIndex: "toOffice",
      key: "toOffice",
      align: "center",
      render: (toOffice) => {
        if (!toOffice) return "---";
        return toOffice.id === officeId
          ? "Bưu cục hiện tại"
          : toOffice.name
      }
    },
    { title: "Trạng thái", dataIndex: "status", key: "status", align: "center", render: (s) => statusTag(s) },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", align: "center" },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => {
        const canCancel = ["draft", "pending", "confirmed"].includes(record.status);
        const canEdit = ["draft", "pending", "confirmed"].includes(record.status);

        return (
          <Space>
            <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/${role}/orders/detail/${record.id}`)}>Xem</Button>
            <Button type="link" icon={<EditOutlined />} disabled={!canEdit} onClick={() => canEdit && navigate(`/${role}/orders/edit/${record.id}`)}>Sửa</Button>
          </Space>
        );
      },
    },
  ];

  return <Table columns={columns} dataSource={tableData} rowKey="key" scroll={{ x: "max-content" }} />;
};

export default OrderTable;