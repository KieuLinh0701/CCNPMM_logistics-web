import React from "react";
import { Table, Button, Space, Tag, message, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined, CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { translateOrderPayer, translateOrderPaymentMethod, translateOrderPaymentStatus, translateOrderStatus } from "../../../../../utils/orderUtils";
import dayjs from "dayjs";
import { Order } from "../../../../../types/order";

interface Props {
  orders: Order[];
  provinceList: { code: number; name: string }[];
  wardList: { code: number; name: string }[];
  role?: string;
  officeId?: number;
  onDetail: (trackingNumber: string) => void;
  onEdit: (trackingNumber: string) => void;
  onApprove: (order: Order) => void;
  oncancel: (orderId: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

const OrderTable: React.FC<Props> = ({ 
  orders, 
  provinceList, 
  wardList, 
  role, 
  officeId, 
  onDetail, 
  onEdit, 
  onApprove, 
  oncancel, 
  currentPage,
  pageSize,
  total, 
  onPageChange }) => {
  const navigate = useNavigate();

  const statusTag = (status: string) => {
    switch (status) {
      case "draft": return <Tag color="default">{translateOrderStatus(status)}</Tag>;
      case "pending": return <Tag color="orange">{translateOrderStatus(status)}</Tag>;
      case "confirmed": return <Tag color="blue">{translateOrderStatus(status)}</Tag>;
      case "picked_up": return <Tag color="purple">{translateOrderStatus(status)}</Tag>;
      case "in_transit": return <Tag color="cyan">{translateOrderStatus(status)}</Tag>;
      case "delivered": return <Tag color="green">{translateOrderStatus(status)}</Tag>;
      case "cancelled": return <Tag color="red">{translateOrderStatus(status)}</Tag>;
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
      render: (text, record) => {
        const trackingNumber = record?.trackingNumber;
        if (!trackingNumber) return <Tag color="default">N/A</Tag>;

        return (
          <Tooltip title="Click để xem chi tiết đơn hàng">
            <span
              onClick={() => navigate(`/${role}/orders/detail/${trackingNumber}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(trackingNumber);
                message.success("Đã copy mã đơn hàng!");
              }}
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                userSelect: 'text',
              }}
            >
              {trackingNumber}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Điểm gửi",
      dataIndex: "fromOffice",
      key: "fromOffice",
      align: "center",
      render: (fromOffice) => {
        if (!fromOffice) return "---";
        return fromOffice.id === officeId
          ? <Tag color="cyan">Bưu cục hiện tại</Tag>
          : fromOffice.name
      }
    },
    {
      title: "Điểm nhận",
      dataIndex: "toOffice",
      key: "toOffice",
      align: "center",
      render: (toOffice) => {
        if (!toOffice)
          return <Tag color="red">Chưa có</Tag>;

        return toOffice.id === officeId
          ? <Tag color="cyan">Bưu cục hiện tại</Tag>
          : toOffice.name;
      }
    },
    { title: "Tên người gửi", dataIndex: "senderName", key: "senderName", align: "center" },
    { title: "SĐT người gửi", dataIndex: "senderPhone", key: "senderPhone", align: "center" },
    {
      title: "Địa chỉ người gửi",
      key: "senderAddress",
      align: "center",
      render: (_, record) => {
        const cityName = provinceList.find((p) => p.code === Number(record.senderCityCode))?.name || "";
        const wardName = wardList.find((w) => w.code === Number(record.senderWardCode))?.name || "";
        const address = `${record.senderDetailAddress || ""}, ${wardName}, ${cityName}`;

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
    { title: "Tên người nhận", dataIndex: "recipientName", key: "recipientName", align: "center" },
    { title: "SĐT người nhận", dataIndex: "recipientPhone", key: "recipientPhone", align: "center" },
    {
      title: "Địa chỉ người nhận",
      key: "recipientAddress",
      align: "center",
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
    { title: "Giá trị đơn (VNĐ)", dataIndex: "orderValue", key: "orderValue", align: "center" },
    { title: "Phí dịch vụ (VNĐ)", dataIndex: "totalFee", key: "totalFee", align: "center" },
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
      width: 250,
      render: (_, record: Order) => {
        const canApprove = record.status === "pending";
        const canCancel = ["picked_up", "confirmed"].includes(record.status);

        // ✅ Điều kiện hiển thị nút Sửa
        const canEdit =
          (
            ["confirmed", "picked_up"].includes(record.status) &&
            record.fromOffice?.id === officeId
          ) ||
          (
            record.status === "in_transit" &&
            record.toOffice?.id === officeId
          );

        const hasPaymentIssue =
          record.paymentMethod !== "Cash" && record.paymentStatus === "Unpaid";

        return (
          <Space>
            {/* Nút Xem */}
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onDetail(record.trackingNumber)}
            >
              Xem
            </Button>

            {/* ✅ Nút Sửa chỉ hiện đúng điều kiện */}
            {!canApprove && (
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                disabled={!canEdit}
                onClick={() => onEdit(record.trackingNumber)}
                style={{ width: 60, textAlign: "left" }}
              >
                Sửa
              </Button>
            )}

            {/* Nút Xác nhận */}
            {canApprove && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                size="small"
                disabled={hasPaymentIssue}
                onClick={() => onApprove(record)}
                style={{ width: 60, textAlign: "left" }}
              >
                Duyệt
              </Button>
            )}

            {/* Nút Hủy */}
            <Button
              type="link"
              icon={<CloseCircleOutlined />}
              size="small"
              disabled={!canCancel}
              onClick={() => oncancel(record.id)}
              style={{ width: 60, textAlign: "left" }}
            >
              Hủy
            </Button>
          </Space>
        );
      }
    }
  ];

  return <Table columns={columns} dataSource={tableData} rowKey="key" scroll={{ x: "max-content" }} pagination={{ current: currentPage, pageSize, total, onChange: onPageChange }} />;
};

export default OrderTable;