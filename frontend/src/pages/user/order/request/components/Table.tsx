import React from 'react';
import { Table, Button, Space, Tag, Tooltip, message } from 'antd';
import { CloseCircleOutlined, CopyOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { ShippingRequest } from '../../../../../types/shippingRequest';
import { translateRequestType, translateStatus } from '../../../../../utils/shippingRequestUtils';

interface TableProps {
  data: ShippingRequest[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onEdit: (request: ShippingRequest) => void;
  onCancel: (id: number) => void;
  onDetail: (request: ShippingRequest) => void;
  onPageChange: (page: number, pageSize?: number) => void;
  role: string;
}

const RequestTable: React.FC<TableProps> = ({
  data,
  currentPage,
  pageSize,
  total,
  loading = false,
  onEdit,
  onDetail,
  onCancel,
  onPageChange,
  role,
}) => {
  const navigate = useNavigate();

  const getStatusTag = (status: string) => {
    const translatedStatus = translateStatus(status);
    switch (status) {
      case 'Pending':
        return <Tag color="orange">{translatedStatus}</Tag>;
      case 'Processing':
        return <Tag color="green">{translatedStatus}</Tag>;
      case 'Resolved':
        return <Tag color="blue">{translatedStatus}</Tag>;
      case 'Rejected':
        return <Tag color="red">{translatedStatus}</Tag>;
      case 'Cancelled':
        return <Tag color="purple">{translatedStatus}</Tag>;
      default:
        return <Tag color="gray">{translatedStatus}</Tag>;
    }
  };

  const getTypeTags = (type: string) => {
    const translatedTypes = translateRequestType(type);
    switch (type) {
      case 'Complaint':
        return <Tag color="red">{translatedTypes}</Tag>;
      case 'DeliveryReminder':
        return <Tag color="orange">{translatedTypes}</Tag>;
      case 'ChangeOrderInfo':
        return <Tag color="blue">{translatedTypes}</Tag>;
      case 'Inquiry':
        return <Tag color="green">{translatedTypes}</Tag>;
      case 'PickupReminder':
        return <Tag color="yellow">{translatedTypes}</Tag>;
      default:
        return <Tag color="gray">{translatedTypes}</Tag>;
    }
  };

  const columns: ColumnsType<ShippingRequest> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: ['order', 'trackingNumber'],
      key: 'trackingNumber',
      align: 'center',
      render: (text, record) => {
        const trackingNumber = record.order?.trackingNumber;

        return trackingNumber && trackingNumber.trim() !== '' ? (
          <Tooltip title="Click để xem chi tiết đơn hàng">
            <span
              onClick={() => navigate(`/${role}/orders/detail/${trackingNumber}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(trackingNumber);
                message.success('Đã copy mã đơn hàng!');
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
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
    },
    { title: 'Loại yêu cầu', dataIndex: 'requestType', key: 'requestType', align: 'center', render: (type) => getTypeTags(type) },
    {
      title: 'Nội dung yêu cầu',
      dataIndex: 'requestContent',
      key: 'requestContent',
      align: 'center',
      width: 300,
      render: (text) => (
        <Tooltip title={text} placement="topLeft">
          <div style={{
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            cursor: 'pointer',
          }}>
            {text && text.trim() !== '' ? text : <Tag color="default">N/A</Tag>}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Phản hồi',
      dataIndex: 'response',
      key: 'response',
      align: 'center',
      width: 300,
      render: (response) =>
        response ? (
          <Tooltip title={response} placement="topLeft">
            <div style={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer'
            }}>
              {response}
            </div>
          </Tooltip>
        ) : (
          <Tag color="default">Chưa có phản hồi</Tag>
        ),
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', align: 'center', render: (status) => getStatusTag(status) },
    { title: 'Thời gian tạo', dataIndex: 'createdAt', key: 'createdAt', align: 'center', render: (date) => new Date(date).toLocaleString('vi-VN') },
    { title: 'Thời gian phản hồi', dataIndex: 'responseAt', key: 'responseAt', align: 'center', render: (date) => new Date(date).toLocaleString('vi-VN') },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record: ShippingRequest) => {
        const canCancel = ["Pending"].includes(record.status);
        const canEdit = ["Pending"].includes(record.status);

        return (
          <Space>
            <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => onDetail(record)}>Xem</Button>
            <Button type="link" icon={<EditOutlined />} size="small" disabled={!canEdit} onClick={() => onEdit(record)}>Sửa</Button>
            <Button type="link" icon={<CloseCircleOutlined />} disabled={!canCancel} size="small" onClick={() => canCancel && record.id && onCancel(record.id)}>Hủy</Button>
          </Space>
        );
      },
    },
  ];

  const tableData = data.map((p, index) => ({
    ...p,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  return (
    <>
      <Tag color="blue" style={{ fontSize: 14, padding: '4px 8px' }}>
        Kết quả trả về: {total} yêu cầu
      </Tag>

      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey="key"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: onPageChange,
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default RequestTable;