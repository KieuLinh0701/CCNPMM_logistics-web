import { Modal, Descriptions, Tag, Button, Typography, Space } from 'antd';
import { CloseCircleOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons';
import { ShippingRequest } from '../../../../../types/shippingRequest';
import { translateRequestType, translateStatus } from '../../../../../utils/shippingRequestUtils';

const { Text } = Typography;

interface DetailModalProps {
    open: boolean;
    request: ShippingRequest | null;
    onClose: () => void;
    onEdit: (request: ShippingRequest) => void;
    onCancel: (requestId: number) => void;
    onViewOrderDetail?: (trackingNumber: string) => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
    open,
    request,
    onClose,
    onEdit,
    onCancel,
    onViewOrderDetail
}) => {
    if (!request) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'orange';
            case 'Processing': return 'blue';
            case 'Resolved': return 'green';
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
        if (request.order?.trackingNumber) {
            onViewOrderDetail?.(request.order.trackingNumber);
        }
    };

    const handleEdit = () => {
        onEdit(request);
    };

    const handelCancel = () => {
        onCancel(request.id);
    };

    return (
        <Modal
            title={
                <span style={{ color: '#1C3D90', fontWeight: 'bold', fontSize: '18px' }}>
                    Chi tiết yêu cầu #{request.id}
                </span>
            }
            open={open}
            onCancel={onClose}
            footer={[
                <Space>
                    {request.status === 'Pending' &&
                        <Button
                            key="viewOrder"
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEdit}
                            style={{ backgroundColor: '#1C3D90' }}
                        >
                            Sửa yêu cầu
                        </Button>
                    }

                    {request.status === 'Pending' &&
                        <Button
                            key="viewOrder"
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            onClick={handelCancel}
                            style={{
                                background: '#e8e8e8',
                                color: '#333333'
                            }}
                        >
                            Hủy yêu cầu
                        </Button>
                    }
                </Space>
            ].filter(Boolean) as React.ReactNode[]}
            width={900}
            centered
            style={{ top: 20 }}
            bodyStyle={{
                maxHeight: '70vh',
                overflowY: 'auto',
                padding: '16px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <Descriptions bordered column={1} size="middle" labelStyle={{
                fontWeight: 'bold',
                width: '190px',
            }}>
                {/* Thông tin cơ bản */}
                <Descriptions.Item label="ID">
                    <Text strong>#{request.id}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Mã đơn hàng">
                    {request.order ? (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                border: '1px solid transparent'
                            }}
                            onClick={handleViewOrder}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f8ff';
                                e.currentTarget.style.borderColor = '#1890ff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <Text strong style={{ color: '#1890ff' }}>
                                {request.order.trackingNumber}
                            </Text>
                            <ExportOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                        </div>
                    ) : (
                        <Text type="secondary">Không có thông tin đơn hàng</Text>
                    )}
                </Descriptions.Item>

                <Descriptions.Item label="Loại yêu cầu">
                    <Tag color={getTypeColor(request.requestType)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {translateRequestType(request.requestType)}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    <Tag color={getStatusColor(request.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                        {translateStatus(request.status)}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Nội dung yêu cầu">
                    <div
                        style={{
                            background: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {request.requestContent && request.requestContent.trim() !== ''
                            ? request.requestContent
                            : <i>Không có nội dung để hiển thị</i>}
                    </div>
                </Descriptions.Item>

                <Descriptions.Item label="Phản hồi từ hệ thống">
                    <div
                        style={{
                            background: '#e7f3ff',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #b3d9ff',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {request.response && request.response.trim() !== ''
                            ? request.response
                            : <i>Chưa có phản hồi</i>}
                    </div>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian tạo">
                    <Text>{new Date(request.createdAt).toLocaleString('vi-VN')}</Text>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default DetailModal;