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
  NodeIndexOutlined,
  TruckOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import StaticGMap from '../../components/StaticGMap';

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
  totalOrders: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  startTime?: string;
  currentStopIndex?: number;
  fromOffice: { id: number; name: string; address: string };
  toOffices: Array<{ id: number; name: string; address: string }>;
}

interface DeliveryStop {
  id: number;
  trackingNumber: string;
  officeName: string;
  officePhone: string;
  officeAddress: string;
  orderCount: number;
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
  toOffice: { 
    id: number;
    name: string; 
    address: string;
    phone?: string;
  };
}

interface OfficeInfo {
  id: number;
  name: string;
  address: string;
}

const DriverRoute: React.FC = () => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [deliveryStops, setDeliveryStops] = useState<DeliveryStop[]>([]);
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStop, setSelectedStop] = useState<DeliveryStop | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    loadContext();
    loadRoute();
  }, []);

  const loadContext = async () => {
    try {
      const res = await api.get('/driver/context');
      const data = (res.data as any)?.data || {};
      setOffices([data.office].filter(Boolean));
      setOffice(data.office || null);
    } catch (error) {
      message.error('Lỗi khi tải thông tin văn phòng');
    }
  };

  const loadRoute = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/route');
      const data = (res.data as any)?.data;
      if (data) {
        setRouteInfo(data.routeInfo || data);
        setDeliveryStops(data.deliveryStops || []);
      }
    } catch (error) {
      message.error('Lỗi khi tải lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = async () => {
    if (!routeInfo) return;

    const openDirections = () => {
      if (!deliveryStops || deliveryStops.length === 0) {
        message.warning('Không có điểm dừng nào trong tuyến');
        return;
      }

      const origin = 'Current+Location';
      const stops = deliveryStops.map(s => s.officeAddress);

      let destination = encodeURIComponent(stops[stops.length - 1]);
      let waypoints = '';

      if (stops.length > 1) {
        const mid = stops.slice(0, -1).map(a => encodeURIComponent(a)).join('|');
        waypoints = `&waypoints=${mid}`;
      }

      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}&travelmode=driving`;
      window.open(url, '_blank');
    };

    Modal.confirm({
      title: 'Bắt đầu tuyến vận chuyển',
      content: 'Bạn có chắc chắn muốn bắt đầu tuyến vận chuyển này?',
      onOk: async () => {
        try {
          await api.post('/driver/route/start', { routeId: routeInfo.id });
          setRouteInfo(prev => prev ? { ...prev, status: 'in_progress' } : null);
          message.success('Đã bắt đầu tuyến vận chuyển');
          openDirections();
        } catch (error) {
          console.error('Start route error:', error);
          // Vẫn mở Google Maps để hỗ trợ driver nếu API chưa sẵn sàng
          openDirections();
        }
      }
    });
  };

  const handlePauseRoute = async () => {
    if (!routeInfo) return;
    
    try {
      await api.post('/driver/route/pause', { routeId: routeInfo.id });
      setRouteInfo(prev => prev ? { ...prev, status: 'paused' } : null);
      message.info('Đã tạm dừng tuyến vận chuyển');
    } catch (error) {
      console.error('Pause route error:', error);
      message.error('Lỗi khi tạm dừng tuyến vận chuyển');
    }
  };

  const handleResumeRoute = async () => {
    if (!routeInfo) return;
    
    try {
      await api.post('/driver/route/resume', { routeId: routeInfo.id });
      setRouteInfo(prev => prev ? { ...prev, status: 'in_progress' } : null);
      message.success('Đã tiếp tục tuyến vận chuyển');
    } catch (error) {
      console.error('Resume route error:', error);
      message.error('Lỗi khi tiếp tục tuyến vận chuyển');
    }
  };

  const handleNavigateToStop = (stop: DeliveryStop) => {
    // Open Google Maps with the address
    const address = encodeURIComponent(stop.officeAddress);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(mapsUrl, '_blank');
    message.success(`Đã mở bản đồ đến ${stop.officeName}`);
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
      case 'pending': return 'Chờ vận chuyển';
      case 'in_progress': return 'Đang vận chuyển';
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
          description="Hiện tại không có lộ trình vận chuyển nào được phân công cho bạn."
          type="info"
          showIcon
          action={
            <Button size="small" onClick={loadRoute}>
              Tải lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Lộ trình vận chuyển</Title>
      
      {/* Thông tin tuyến */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Title level={4} style={{ margin: 0 }}>{routeInfo.name || 'Tuyến vận chuyển'}</Title>
              <Text type="secondary">{routeInfo.startLocation || routeInfo.fromOffice?.address}</Text>
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
              value={routeInfo.totalStops || deliveryStops.length}
              prefix={<EnvironmentOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Đã hoàn thành"
              value={routeInfo.completedStops || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng khoảng cách"
              value={routeInfo.totalDistance || 0}
              suffix="km"
              prefix={<CarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Thời gian ước tính"
              value={routeInfo.estimatedDuration || 0}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
        </Row>
        
        <div style={{ marginTop: '16px' }}>
          <Text strong>Tiến độ: </Text>
          <Progress 
            percent={Math.round(((routeInfo.completedStops || 0) / (routeInfo.totalStops || deliveryStops.length || 1)) * 100)} 
            status={routeInfo.status === 'completed' ? 'success' : 'active'}
          />
        </div>
      </Card>

      {/* Bản đồ Google tĩnh (hiển thị điểm dừng đầu tiên nếu có) */}
      {deliveryStops.length > 0 && (
        <StaticGMap
          title="Bản đồ lộ trình (Google Maps)"
          query={deliveryStops[0].officeAddress}
          height={450}
        />
      )}

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
                      backgroundColor: '#1890ff',
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
                    <Text strong>{stop.officeName}</Text>
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
                    <Text>{stop.officeAddress}</Text>
                    <Space>
                      <PhoneOutlined style={{ color: '#666' }} />
                      <Text style={{ fontSize: '12px' }}>{stop.officePhone}</Text>
                      <TruckOutlined style={{ color: '#1890ff' }} />
                      <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                        {stop.orderCount} đơn hàng
                      </Text>
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
              <Text strong>Bưu cục đích: </Text>
              <Text>{selectedStop.officeName}</Text>
            </div>
            <div>
              <Text strong>Địa chỉ bưu cục: </Text>
              <Text>{selectedStop.officeAddress}</Text>
            </div>
            <div>
              <Text strong>Số điện thoại: </Text>
              <Text>{selectedStop.officePhone}</Text>
            </div>
            <div>
              <Text strong>Số đơn hàng: </Text>
              <Text style={{ color: '#1890ff' }}>
                {selectedStop.orderCount} đơn hàng
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
            <div>
              <Text strong>Khoảng cách: </Text>
              <Text>{selectedStop.distance}km</Text>
            </div>
            <div>
              <Text strong>Thời gian di chuyển: </Text>
              <Text>{selectedStop.travelTime} phút</Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default DriverRoute;
