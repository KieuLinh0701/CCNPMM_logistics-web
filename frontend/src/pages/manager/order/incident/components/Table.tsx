import React from "react";
import dayjs from "dayjs";
import { Table, Tag, Tooltip, Button, message } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { Incident } from "../../../../../types/incidentReport";
import { translateIncidentStatus, translateIncidentType } from "../../../../../utils/incidentReportUtils";

interface Props {
  incidents: Incident[];
  role: string;
  onViewIncident: (incident: Incident) => void;
  onEdit: (incident: Incident) => void;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, pageSize?: number) => void;
}

const IncidentTable: React.FC<Props> = ({
  incidents,
  role,
  onViewIncident,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onEdit
}) => {
  const navigate = useNavigate();

  const typeTag = (type: string) => <Tag color="blue">{translateIncidentType(type)}</Tag>;

  const statusTag = (status: string) => {
    switch (status) {
      case "pending": return <Tag color="orange">{translateIncidentStatus(status)}</Tag>;
      case "processing": return <Tag color="cyan">{translateIncidentStatus(status)}</Tag>;
      case "resolved": return <Tag color="green">{translateIncidentStatus(status)}</Tag>;
      case "rejected": return <Tag color="red">{translateIncidentStatus(status)}</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const priorityTag = (priority: string) => {
    switch (priority) {
      case "low": return <Tag color="green">Thấp</Tag>;
      case "medium": return <Tag color="orange">Trung bình</Tag>;
      case "high": return <Tag color="red">Cao</Tag>;
      default: return <Tag>{priority}</Tag>;
    }
  };

  const tableData = incidents.map((i) => ({ ...i, key: String(i.id) }));

  const columns: ColumnsType<any> = [
    { title: "ID", dataIndex: "id", key: "id", align: "center" },
    {
      title: "Mã đơn hàng",
      key: "trackingNumber",
      align: "center",
      render: (_, record) => {
        const trackingNumber = record?.order?.trackingNumber;
        if (!trackingNumber) return <Tag color="default">N/A</Tag>;
        return (
          <Tooltip title="Click để xem chi tiết đơn hàng">
            <span
              style={{ color: "#1890ff", cursor: "pointer" }}
              onClick={() => navigate(`/${role}/orders/detail/${trackingNumber}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(trackingNumber);
                message.success("Đã copy mã đơn hàng!");
              }}
            >
              {trackingNumber}
            </span>
          </Tooltip>
        );
      },
    },
    { title: "Tiêu đề", dataIndex: "title", key: "title", align: "center" },
    { title: "Loại sự cố", dataIndex: "incidentType", key: "incidentType", align: "center", render: (t) => typeTag(t) },
    { title: "Trạng thái", dataIndex: "status", key: "status", align: "center", render: (_, record) => statusTag(record.status) },
    { title: "Độ ưu tiên", dataIndex: "priority", key: "priority", align: "center", render: (p) => priorityTag(p) },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const canEdit = ["pending", "processing"].includes(record.status);
        return (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              disabled={!canEdit}
            >
              Xử lý
            </Button>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => onViewIncident(record)}
            >
              Xem
            </Button>
          </div>
        );
      },
    }
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
  />;
};

export default IncidentTable;