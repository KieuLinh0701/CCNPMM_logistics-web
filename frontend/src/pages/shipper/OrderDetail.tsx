import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Descriptions, 
  Tag, 
  Button, 
  Space, 
  Divider, 
  Image, 
  Modal,
  message,
  Spin,
  Alert
} from 'antd';
import { 
  ArrowLeftOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import shipperService from '../../services/shipperService';

const { Title, Text, Paragraph } = Typography;

interface OrderDetail {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'normal' | 'urgent';
  serviceType: string;
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
  proofImages?: string[];
  actualRecipient?: string;
  actualRecipientPhone?: string;
  codCollected?: number;
}

const ShipperOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail(parseInt(id));
    }
  }, [id]);

  const fetchOrderDetail = async (orderId: number) => {
    try {
      setLoading(true);
      const order = await shipperService.getOrderDetail(orderId);
      setOrder(order);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      message.error('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!order) return;
    
    Modal.confirm({
      title: 'Bắt đầu giao hàng',
      content: 'Bạn có chắc chắn muốn bắt đầu giao đơn hàng này?',
      onOk: async () => {
        try {
          setActionLoading(true);
          await shipperService.updateDeliveryStatus(order.id, { status: 'in_transit' });
          setOrder(prev => prev ? { ...prev, status: 'in_transit' } : null);
          message.success('Đã bắt đầu giao hàng');
          navigate(`/shipper/delivery/${order.id}`);
        } catch (error) {
          message.error('Lỗi khi cập nhật trạng thái');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleCallRecipient = () => {
    if (order?.recipientPhone) {
      window.open(`tel:${order.recipientPhone}`);
    }
  };

  const handleViewMap = () => {
    // TODO: Implement map view
    message.info('Tính năng xem bản đồ đang được phát triển');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'blue';
      case 'picked_up': return 'orange';
      case 'in_transit': return 'processing';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'picked_up': return 'Đã lấy hàng';
      case 'in_transit': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'red' : 'default';
  };

  const getPriorityText = (priority: string) => {
    return priority === 'urgent' ? 'Ưu tiên' : 'Bình thường';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không tìm thấy đơn hàng"
          description="Đơn hàng không tồn tại hoặc bạn không có quyền truy cập."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/shipper/orders')}
            >
              Quay lại
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Chi tiết đơn hàng
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<PrinterOutlined />}>In vận đơn</Button>
            <Button icon={<ShareAltOutlined />}>Chia sẻ</Button>
          </Space>
        </Col>
      </Row>

      {/* Thông tin cơ bản */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24}>
          <Col span={16}>
            <Descriptions title="Thông tin đơn hàng" bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng" span={2}>
                <Text strong style={{ fontSize: '16px' }}>{order.trackingNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ưu tiên">
                <Tag color={getPriorityColor(order.priority)}>
                  {getPriorityText(order.priority)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dịch vụ">
                <Text>{order.serviceType}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Text>{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
              </Descriptions.Item>
              {order.deliveredAt && (
                <Descriptions.Item label="Ngày giao">
                  <Text>{dayjs(order.deliveredAt).format('DD/MM/YYYY HH:mm')}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>
          <Col span={8}>
            <Card title="Thông tin người nhận" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>{order.recipientName}</Text>
                </div>
                <div>
                  <Space>
                    <PhoneOutlined />
                    <Text>{order.recipientPhone}</Text>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={handleCallRecipient}
                    >
                      Gọi
                    </Button>
                  </Space>
                </div>
                <div>
                  <Space>
                    <EnvironmentOutlined />
                    <Text>{order.recipientAddress}</Text>
                  </Space>
                </div>
                {order.codAmount > 0 && (
                  <div>
                    <Space>
                      <DollarOutlined />
                      <Text strong style={{ color: '#f50' }}>
                        COD: {order.codAmount.toLocaleString()}đ
                      </Text>
                    </Space>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Ghi chú */}
      {order.notes && (
        <Card title="Ghi chú" style={{ marginBottom: '24px' }}>
          <Paragraph>{order.notes}</Paragraph>
        </Card>
      )}

      {/* Hình ảnh minh chứng */}
      {order.proofImages && order.proofImages.length > 0 && (
        <Card title="Hình ảnh minh chứng" style={{ marginBottom: '24px' }}>
          <Image.PreviewGroup>
            {order.proofImages.map((image, index) => (
              <Image
                key={index}
                width={150}
                height={150}
                src={image}
                style={{ marginRight: '8px', marginBottom: '8px' }}
              />
            ))}
          </Image.PreviewGroup>
        </Card>
      )}

      {/* Thông tin người nhận thực tế */}
      {(order.actualRecipient || order.actualRecipientPhone) && (
        <Card title="Thông tin người nhận thực tế" style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            {order.actualRecipient && (
              <Col span={12}>
                <Text strong>Người nhận: </Text>
                <Text>{order.actualRecipient}</Text>
              </Col>
            )}
            {order.actualRecipientPhone && (
              <Col span={12}>
                <Text strong>Số điện thoại: </Text>
                <Text>{order.actualRecipientPhone}</Text>
              </Col>
            )}
          </Row>
          {order.codCollected && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>COD đã thu: </Text>
              <Text style={{ color: '#52c41a' }}>
                {order.codCollected.toLocaleString()}đ
              </Text>
            </div>
          )}
        </Card>
      )}

      {/* Actions */}
      <Card>
        <Row justify="center">
          <Space size="large">
            {order.status === 'confirmed' && (
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                loading={actionLoading}
                onClick={handleStartDelivery}
              >
                Bắt đầu giao hàng
              </Button>
            )}
            <Button
              size="large"
              icon={<GlobalOutlined />}
              onClick={handleViewMap}
            >
              Xem bản đồ
            </Button>
            <Button
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => navigate(`/shipper/delivery/${order.id}`)}
            >
              Cập nhật trạng thái
            </Button>
          </Space>
        </Row>
      </Card>
    </div>
  );
};

export default ShipperOrderDetail;