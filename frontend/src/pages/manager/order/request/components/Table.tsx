import React from 'react';
import { Table, Button, Space, Tag, Tooltip, message } from 'antd';
import { CopyOutlined, EyeOutlined, InfoCircleOutlined, SolutionOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { ShippingRequest } from '../../../../../types/shippingRequest';
import { translateRequestType, translateStatus } from '../../../../../utils/shippingRequestUtils';
import { City, Ward } from '../../../../../types/location';

interface TableProps {
  data: ShippingRequest[];
  currentPage: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  wards: Ward[];
  cities: City[];
  onProcess: (request: ShippingRequest) => void;
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
  onProcess,
  onDetail,
  onPageChange,
  role,
  wards,
  cities,
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

  const columns: ColumnsType<ShippingRequest> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: ['order', 'trackingNumber'],
      key: 'trackingNumber',
      align: 'center',
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/${role}/orders/detail/${record.order?.trackingNumber}`)}
            style={{ padding: 0 }}
          >
            {text}
          </Button>
          {text && text.trim() !== '' ? (
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
          ) : (
            <Tag color="default">N/A</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Người gửi',
      key: 'sender',
      align: 'center',
      width: 200,
      render: (_, record) => {
        const name = record.user
          ? `${record.user.firstName} ${record.user.lastName}`
          : record.contactName || 'Khách vãng lai';
        const phone = record.user?.phoneNumber || record.contactPhoneNumber || '-';
        const email = record.user?.email || record.contactEmail || '-';

        const cityCode = record.user?.codeCity || record.contactCityCode;
        const wardCode = record.user?.codeWard || record.contactWardCode;
        const detail = record.user?.detailAddress || record.contactDetailAddress || '-';

        const cityName = cities.find(c => c.code === cityCode)?.name || '';
        const wardName = wards.find(w => w.code === wardCode)?.name || '';

        const fullAddress = [detail, wardName, cityName].filter(Boolean).join(', ') || '-';

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>{name}</span>
            <Tooltip
              placement="topLeft"
              title={
                <div>
                  <div>SĐT: {phone}</div>
                  <div>Email: {email}</div>
                  <div>Địa chỉ: {fullAddress}</div>
                </div>
              }
            >
              <EyeOutlined style={{ marginLeft: 6, color: '#1890ff', cursor: 'pointer' }} />
            </Tooltip>
          </div>
        );
      }
    },
    {
      title: 'Loại yêu cầu',
      dataIndex: 'requestType',
      key: 'requestType',
      align: 'center',
      render: (type) => translateRequestType(type)
    },
    {
      title: 'Nội dung yêu cầu',
      dataIndex: 'requestContent',
      key: 'requestContent',
      align: 'center',
      width: 250,
      render: (text) => {
        if (!text || text.trim() === '') {
          return <Tag color="default">N/A</Tag>;
        }

        return (
          <Tooltip title={text} placement="topLeft">
            <div style={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              cursor: 'pointer'
            }}>
              {text}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Phản hồi',
      dataIndex: 'response',
      key: 'response',
      align: 'center',
      width: 250,
      render: (response) => {
        if (!response) return <Tag color="red">Chưa phản hồi</Tag>;

        return (
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
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Thời gian phản hồi',
      dataIndex: 'responseAt',
      key: 'responseAt',
      align: 'center',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record: ShippingRequest) => {
        const canProcess = ["Pending", "Processing"].includes(record.status);
        const actionLabel = record.status === "Processing" ? "Cập nhật" : "Xử lý";

        return (
          <Space>
            <Button type="link" icon={<EyeOutlined />} size="small" onClick={() => onDetail(record)}>Xem</Button>
            <Button type="link" icon={<SolutionOutlined />} size="small" disabled={!canProcess} onClick={() => onProcess(record)}>{actionLabel}</Button>
          </Space>
        );
      },
    }
  ];

  const tableData = data.map((p, index) => ({
    ...p,
    key: String(index + 1 + (currentPage - 1) * pageSize),
  }));

  const totalColumnsWidth = 160 + 200 + 250 + 250 + 120 + 200 + 200 + 150 + 20;

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
          pagination={{ current: currentPage, pageSize, total, onChange: onPageChange }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );
};

export default RequestTable;