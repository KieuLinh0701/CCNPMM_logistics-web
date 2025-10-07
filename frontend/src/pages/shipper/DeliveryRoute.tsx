import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  List, 
  Tag, 
  Progress, 
  Statistic,
  Modal,
  message,
  Spin,
  Alert,
  Divider
} from 'antd';
import { 
  EnvironmentOutlined,
  PhoneOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CarOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface RouteInfo {
  id: number;
  name: string;
  startLocation: string;
  totalStops: number;
  completedStops: number;
  totalDistance: number;
  estimatedDuration: number;
  actualDuration?: number;
  totalCOD: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startTime?: string;
  currentStopIndex?: number;
}

interface DeliveryStop {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  priority: 'normal' | 'urgent';
  serviceType: string;
  estimatedTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  coordinates: {
    lat: number;
    lng: number;
  };
  distance: number;
  travelTime: number;
}

const ShipperDeliveryRoute: React.FC = () => {
  const navigate = useNavigate();
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [deliveryStops, setDeliveryStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStop, setSelectedStop] = useState<DeliveryStop | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    fetchRouteData();
  }, []);

  const fetchRouteData = async () => {
    try {
      setLoading(true);
      const routeData = await shipperService.getDeliveryRoute();
      setRouteInfo(routeData.routeInfo);
      setDeliveryStops(routeData.deliveryStops);
    } catch (error) {
      console.error('Error fetching route data:', error);
      message.error('Lỗi khi tải dữ liệu lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = async () => {
    if (!routeInfo) return;
    
    Modal.confirm({
      title: 'Bắt đầu tuyến giao hàng',
      content: 'Bạn có chắc chắn muốn bắt đầu tuyến giao hàng này?',
      onOk: async () => {
        try {
          await shipperService.startRoute(routeInfo.id);
          setRouteInfo(prev => prev ? { ...prev, status: 'in_progress' } : null);
          message.success('Đã bắt đầu tuyến giao hàng');
        } catch (error) {
          message.error('Lỗi khi bắt đầu tuyến giao hàng');
        }
      }
    });
  };

  const handlePauseRoute = () => {
    setRouteInfo(prev => prev ? { ...prev, status: 'paused' } : null);
    message.info('Đã tạm dừng tuyến giao hàng');
  };

  const handleResumeRoute = () => {
    setRouteInfo(prev => prev ? { ...prev, status: 'in_progress' } : null);
    message.success('Đã tiếp tục tuyến giao hàng');
  };

  const handleNavigateToStop = (stop: DeliveryStop) => {
    // TODO: Implement navigation to stop
    message.info(`Chỉ đường đến ${stop.recipientName}`);
  };

  const handleViewStopDetail = (stop: DeliveryStop) => {
    setSelectedStop(stop);
    setDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'in_progress': return 'processing';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ giao';
      case 'in_progress': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'failed': return 'Thất bại';
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
        <div style={{ marginTop: '16px' }}>Đang tải dữ liệu lộ trình...</div>
      </div>
    );
  }

  if (!routeInfo) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Không có dữ liệu lộ trình"
          description="Hiện tại không có lộ trình giao hàng nào được phân công cho bạn."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Lộ trình giao hàng</Title>
      
      {/* Thông tin tuyến */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{routeInfo.name}</Title>
              <Text type="secondary">{routeInfo.startLocation}</Text>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              {routeInfo.status === 'not_started' && (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartRoute}>
                  Bắt đầu tuyến
                </Button>
              )}
              {routeInfo.status === 'in_progress' && (
                <Button icon={<PauseCircleOutlined />} onClick={handlePauseRoute}>
                  Tạm dừng
                </Button>
              )}
              {routeInfo.status === 'paused' && (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleResumeRoute}>
                  Tiếp tục
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Tổng điểm dừng"
              value={routeInfo.totalStops}
              prefix={<EnvironmentOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Đã hoàn thành"
              value={routeInfo.completedStops}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng khoảng cách"
              value={routeInfo.totalDistance}
              suffix="km"
              prefix={<CarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Thời gian ước tính"
              value={routeInfo.estimatedDuration}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Text strong>Tiến độ: </Text>
          <Progress 
            percent={Math.round((routeInfo.completedStops / routeInfo.totalStops) * 100)} 
            status={routeInfo.status === 'completed' ? 'success' : 'active'}
          />
        </div>
      </Card>

      {/* Danh sách điểm dừng */}
      <Card title="Danh sách điểm dừng">
        <List
          dataSource={deliveryStops}
          renderItem={(stop, index) => (
            <List.Item
              actions={[
                <Button
                  key="detail"
                  size="small"
                  onClick={() => handleViewStopDetail(stop)}
                >
                  Chi tiết
                </Button>,
                <Button
                  key="navigate"
                  size="small"
                  icon={<CompassOutlined />}
                  onClick={() => handleNavigateToStop(stop)}
                >
                  Chỉ đường
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div style={{ textAlign: 'center', minWidth: '40px' }}>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      backgroundColor: stop.status === 'completed' ? '#52c41a' : 
                                     stop.status === 'in_progress' ? '#1890ff' : '#d9d9d9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      margin: '0 auto'
                    }}>
                      {index + 1}
                    </div>
                  </div>
                }
                title={
                  <Space>
                    <Text strong>{stop.recipientName}</Text>
                    <Tag color={getStatusColor(stop.status)}>
                      {getStatusText(stop.status)}
                    </Tag>
                    <Tag color={getPriorityColor(stop.priority)}>
                      {getPriorityText(stop.priority)}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text>{stop.recipientAddress}</Text>
                    <Space>
                      <PhoneOutlined style={{ color: '#666' }} />
                      <Text style={{ fontSize: '12px' }}>{stop.recipientPhone}</Text>
                      {stop.codAmount > 0 && (
                        <>
                          <DollarOutlined style={{ color: '#f50' }} />
                          <Text style={{ fontSize: '12px', color: '#f50' }}>
                            {stop.codAmount.toLocaleString()}đ
                          </Text>
                        </>
                      )}
                    </Space>
                    <Space>
                      <NodeIndexOutlined style={{ color: '#faad14' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {stop.distance}km - {stop.travelTime} phút từ điểm trước
                      </Text>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Modal chi tiết điểm dừng */}
      <Modal
        title="Chi tiết điểm dừng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          <Button
            key="navigate"
            type="primary"
            icon={<CompassOutlined />}
            onClick={() => {
              if (selectedStop) {
                handleNavigateToStop(selectedStop);
                setDetailModal(false);
              }
            }}
          >
            Chỉ đường
          </Button>
        ]}
      >
        {selectedStop && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Mã đơn hàng: </Text>
              <Text>{selectedStop.trackingNumber}</Text>
            </div>
            <div>
              <Text strong>Người nhận: </Text>
              <Text>{selectedStop.recipientName}</Text>
            </div>
            <div>
              <Text strong>Số điện thoại: </Text>
              <Text>{selectedStop.recipientPhone}</Text>
            </div>
            <div>
              <Text strong>Địa chỉ: </Text>
              <Text>{selectedStop.recipientAddress}</Text>
            </div>
            <div>
              <Text strong>COD: </Text>
              <Text style={{ color: '#f50' }}>
                {selectedStop.codAmount > 0 ? `${selectedStop.codAmount.toLocaleString()}đ` : 'Không COD'}
              </Text>
            </div>
            <div>
              <Text strong>Dịch vụ: </Text>
              <Text>{selectedStop.serviceType}</Text>
            </div>
            <div>
              <Text strong>Thời gian ước tính: </Text>
              <Text>{selectedStop.estimatedTime}</Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ShipperDeliveryRoute;