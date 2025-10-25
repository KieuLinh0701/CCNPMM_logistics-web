import React from "react";
import dayjs from 'dayjs';
import { Table, Button, Space, Tag, Tooltip, message } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Transaction } from "../../../../../types/transaction";
import { translateTransactionPurpose, translateTransactionStatus, translateTransactionType } from "../../../../../utils/transactionUtils";

interface Props {
  transactions: Transaction[];
  role: string;
  onViewTransaction: (transaction: Transaction) => void;
}

const RevenueTable: React.FC<Props> = ({ transactions, role, onViewTransaction }) => {
  const navigate = useNavigate();

  const typeTag = (type: string) => {
    switch (type) {
      case "Income": return <Tag color="green">{translateTransactionType(type)}</Tag>;
      case "Expense": return <Tag color="orange">{translateTransactionType(type)}</Tag>;
      default: return <Tag>{type}</Tag>;
    }
  };

  const statusTag = (status: string) => {
    switch (status) {
      case "Pending": return <Tag color="orange">{translateTransactionStatus(status)}</Tag>;
      case "Confirmed": return <Tag color="green">{translateTransactionStatus(status)}</Tag>;
      case "Rejected": return <Tag color="red">{translateTransactionStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const tableData = transactions.map((o) => ({ ...o, key: String(o.id) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã giao dịch",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Mã đối soát",
      dataIndex: "paymentSubmissionId",
      key: "paymentSubmissionId",
      align: "center",
      render: (text) =>
        text ? (
          <span>{text}</span>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: "Mã đơn hàng",
      key: "trackingNumber",
      align: "center",
      render: (text, record) => {
        const trackingNumber = record?.order?.trackingNumber;
        if (!trackingNumber) return <Tag color="default">N/A</Tag>;

        return (
          <Space size="small">
            <Button
              type="link"
              onClick={() => navigate(`/${role}/orders/detail/${trackingNumber}`)}
              style={{ padding: 0 }}
            >
              {trackingNumber}
            </Button>
            <Tooltip title="Copy mã đơn hàng">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(trackingNumber);
                  message.success('Đã copy mã đơn hàng!');
                }}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (_, record) => statusTag(record.status)
    },
    { title: "Khoảng tiền (VNĐ)", dataIndex: "amount", key: "amount", align: "center" },
    { title: "Loại doanh thu", dataIndex: "type", key: "type", align: "center", render: (p) => typeTag(p) },
    { title: "Loại giao dịch", dataIndex: "purpose", key: "purpose", align: "center", render: (p) => translateTransactionPurpose(p) },
    {
      title: "Phương thức thanh toán",
      dataIndex: "method",
      key: "method",
      align: "center",
      render: (_, record) => record.method ? record.method : <Tag color="default">N/A</Tag>
    },
    { title: "Thời điểm tạo", 
      dataIndex: "createdAt", 
      key: "createdAt", 
      align: "center", 
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : <Tag color="default">N/A</Tag>
    },
    { title: "Thời điểm giao dịch", 
      dataIndex: "confirmedAt", 
      key: "confirmedAt", 
      align: "center", 
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : <Tag color="default">N/A</Tag>
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onViewTransaction(record)}
        >
          Xem
        </Button>
      )
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

export default RevenueTable;