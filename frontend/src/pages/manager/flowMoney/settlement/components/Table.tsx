import React from "react";
import dayjs from 'dayjs';
import { Table, Button, Space, Tag, Tooltip, message } from "antd";
import { EyeOutlined, EditOutlined, CloseCircleOutlined, CopyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Transaction } from "../../../../../types/transaction";
import { translateTransactionPurpose, translateTransactionStatus, translateTransactionType } from "../../../../../utils/transactionUtils";
import { PaymentSubmission } from "../../../../../types/paymentSubmission";
import { translatePaymentSubmissionStatus } from "../../../../../utils/paymentSubmissionUtils";

interface Props {
  submissions: PaymentSubmission[];
  onProcess: (submission: PaymentSubmission) => void;
  onDetail: (submissionId: number) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

const SubmissionTable: React.FC<Props> = ({
  submissions,
  onProcess,
  onDetail,
  currentPage,
  pageSize,
  total,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const statusTag = (status: string) => {
    switch (status) {
      case "Pending": return <Tag color="orange">{translateTransactionStatus(status)}</Tag>;
      case "Confirmed": return <Tag color="green">{translateTransactionStatus(status)}</Tag>;
      case "Rejected": return <Tag color="red">{translateTransactionStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const tableData = submissions.map((o) => ({ ...o, key: String(o.id) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã đối soát",
      dataIndex: "id",
      key: "id",
      align: "center",
    },
    {
      title: "Người nộp",
      dataIndex: "submittedBy",
      key: "submittedBy",
      align: "center",
      render: (submittedBy) =>
        submittedBy ? (
          <Tooltip title={`ID: ${submittedBy.id}`}>
            <span>
              {[submittedBy.lastName, submittedBy.firstName,].filter(Boolean).join(" ")}
            </span>
          </Tooltip>
        ) : null,
    },
    {
      title: "Ngày nộp",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) =>
        dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Tổng nộp (VNĐ)",
      dataIndex: "totalAmountSubmitted",
      key: "totalAmountSubmitted",
      align: "center",
      render: (amount) =>
        amount.toLocaleString("vi-VN"),
    },
    {
      title: "Người xác nhận",
      dataIndex: "confirmedBy",
      key: "confirmedById",
      align: "center",
      render: (confirmedBy) =>
        confirmedBy ? (
          <Tooltip title={`ID: ${confirmedBy.id}`}>
            <span>
              {[confirmedBy.lastName, confirmedBy.firstName].filter(Boolean).join(" ")}
            </span>
          </Tooltip>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: "Ngày xác nhận",
      dataIndex: "reconciledAt",
      key: "reconciledAt",
      align: "center",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : <Tag color="default">N/A</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => statusTag(status),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      align: "center",
      render: (text) =>
        text ? <span>{text}</span> : <Tag color="default">N/A</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 250,
      render: (_, record: PaymentSubmission) => {
        const canProcess = ["Pending", "Rejected"].includes(record.status);
        return (
          <Space>
            {/* Nút Xác nhận */}
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              size="small"
              disabled={!canProcess}
              onClick={() => onProcess(record)}
              style={{ width: 60, textAlign: "left" }}
            >
              Đối soát
            </Button>

            {/* Nút Xem */}
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onDetail(record.id)}
            >
              DS đơn hàng
            </Button>

          </Space>
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
    style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }} />;
};

export default SubmissionTable;