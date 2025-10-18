import { Modal, Descriptions, Tag, Button, Typography, Input, Select } from 'antd';
import { ExportOutlined, EditOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { ShippingRequest } from '../../../../../types/shippingRequest';
import { translateRequestType, translateStatus } from '../../../../../utils/shippingRequestUtils';
import { useEffect, useState } from 'react';
import { City, Ward } from '../../../../../types/location';

const { Text } = Typography;

interface RequestModalProps {
  open: boolean;
  request: ShippingRequest | null;
  mode: 'view' | 'edit';
  statuses: string[];
  onClose: () => void;
  onUpdate?: (response: string, status: string) => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  onViewOrderDetail?: (trackingNumber: string) => void;
  wards: Ward[];
  cities: City[];
}

const RequestModal: React.FC<RequestModalProps> = ({
  open,
  request,
  mode,
  statuses,
  onUpdate,
  onClose,
  onEdit,
  onCancelEdit,
  onViewOrderDetail,
  wards,
  cities,
}) => {
  const [response, setResponse] = useState(request?.response || '');
  const [status, setStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (request) {
      setResponse(request.response || '');
      setStatus(undefined);
    }
  }, [request, mode]);

  if (!request) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Processing': return 'green';
      case 'Resolved': return 'blue';
      case 'Rejected': return 'red';
      case 'Cancelled': return 'purple';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Complaint': return 'red';
      case 'DeliveryReminder': return 'orange';
      case 'ChangeOrderInfo': return 'blue';
      case 'Inquiry': return 'green';
      default: return 'default';
    }
  };

  const handleViewOrder = () => {
    if (request.order?.trackingNumber) onViewOrderDetail?.(request.order.trackingNumber);
  };

  const handleSave = () => onUpdate?.(response, status!);
  const handleEditClick = () => onEdit?.();

  const allowedNextStatus: Record<string, string[]> = {
    Pending: ["Processing", "Resolved", "Rejected"],
    Processing: ["Resolved"],
  };

  return (
    <Modal
      title={<span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '18px' }}>Chi tiết yêu cầu</span>}
      open={open}
      onCancel={onClose}
      width={900}
      centered
      className="hidden-scroll-modal"
      bodyStyle={{ maxHeight: '80vh', overflowY: 'scroll', padding: '16px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      footer={
        mode === "view"
          ? request.status === "Pending"
            ? <Button type="primary" icon={<EditOutlined />} style={{ backgroundColor: "#1C3D90" }} onClick={handleEditClick}>Xử lý yêu cầu</Button>
            : request.status === "Processing"
              ? <Button type="primary" icon={<EditOutlined />} style={{ backgroundColor: "#1C3D90" }} onClick={handleEditClick}>Cập nhật trạng thái</Button>
              : null
          : [
            <Button key="save" type="primary" onClick={handleSave} style={{ backgroundColor: "#1C3D90", color: "#fff" }}>Lưu</Button>,
            <Button key="cancel" onClick={() => onCancelEdit?.()} style={{ backgroundColor: "#e0e0e0", color: "#333" }}>Hủy</Button>,
          ]
      }
    >
      <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold', width: '190px' }}>

        <Descriptions.Item label="Người gửi">
          {(() => {
            const name = request.user ? `${request.user.firstName} ${request.user.lastName}` : request.contactName || 'Khách vãng lai';
            const phone = request.user?.phoneNumber || request.contactPhoneNumber || '-';
            const email = request.user?.email || request.contactEmail || '-';
            const cityCode = request.user?.codeCity || request.contactCityCode;
            const wardCode = request.user?.codeWard || request.contactWardCode;
            const detail = request.user?.detailAddress || request.contactDetailAddress || '-';
            const cityName = cities.find(c => c.code === cityCode)?.name || '';
            const wardName = wards.find(w => w.code === wardCode)?.name || '';
            const fullAddress = [detail, wardName, cityName].filter(Boolean).join(', ') || '-';

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  backgroundColor: '#fffbea', 
                  padding: '8px 12px',
                  borderRadius: '6px',
                }}
              >
                <Text strong>{name}</Text>
                <Text>SĐT: {phone}</Text>
                <Text>Email: {email}</Text>
                <Text>Địa chỉ: {fullAddress}</Text>
              </div>
            );
          })()}
        </Descriptions.Item>

        <Descriptions.Item label="Mã đơn hàng">
          {request.order ? (
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 6, cursor: 'pointer', transition: 'all 0.3s', border: '1px solid transparent' }}
              onClick={handleViewOrder}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f8ff'; e.currentTarget.style.borderColor = '#1890ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <Text strong style={{ color: '#1890ff' }}>{request.order.trackingNumber}</Text>
              <ExportOutlined style={{ color: '#1890ff', fontSize: 12 }} />
            </div>
          ) : <Text type="secondary">Không có thông tin đơn hàng</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Loại yêu cầu">
          <Tag color={getTypeColor(request.requestType)} style={{ fontSize: 14, padding: '4px 8px' }}>
            {translateRequestType(request.requestType)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái">
          {mode === 'view'
            ? <Tag color={getStatusColor(request.status)} style={{ fontSize: 14, padding: '4px 8px' }}>{translateStatus(request.status)}</Tag>
            : <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Tag color={getStatusColor(request.status)} style={{ fontSize: 14, padding: '4px 8px' }}>{translateStatus(request.status)}</Tag>
              <ArrowRightOutlined style={{ color: '#1C3D90', fontSize: 16 }} />
              <Select value={status} onChange={setStatus} style={{ width: 180 }} placeholder="Chọn trạng thái...">
                {(allowedNextStatus[request.status] || []).map(s => (
                  <Select.Option key={s} value={s}>{translateStatus(s)}</Select.Option>
                ))}
              </Select>
            </div>
          }
        </Descriptions.Item>

        <Descriptions.Item label="Nội dung yêu cầu">
          <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 6, border: '1px solid #e9ecef', whiteSpace: 'pre-wrap' }}>
            {request.requestContent?.trim() || <i>Không có nội dung để hiển thị</i>}
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Phản hồi">
          {mode === 'view'
            ? <div style={{ background: '#e7f3ff', padding: 12, borderRadius: 6, border: '1px solid #b3d9ff', whiteSpace: 'pre-wrap' }}>
              {request.response?.trim() || <i>Chưa phản hồi</i>}
            </div>
            : <Input.TextArea value={response} onChange={e => setResponse(e.target.value)} rows={5} maxLength={1000} />}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian yêu cầu">
          <Text>{new Date(request.createdAt).toLocaleString('vi-VN')}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian phản hồi">
          <Text>{request.responseAt ? new Date(request.responseAt).toLocaleString('vi-VN') : ""}</Text>
        </Descriptions.Item>
      </Descriptions>
      <style>
        {`
          .hidden-scroll-modal::-webkit-scrollbar {
            display: none; 
          }
        `}
      </style>
    </Modal>
  );
};

export default RequestModal;