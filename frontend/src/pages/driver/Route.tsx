import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Space, Tag, List, message } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, TruckOutlined, PlayCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import StaticGMap from '../../components/StaticGMap';

const { Title, Text } = Typography;

interface RouteInfo {
  id: number;
  fromOffice: { id: number; name: string; address: string };
  toOffices: Array<{ id: number; name: string; address: string }>;
  distance: number;
  estimatedTime: number;
  orders: Array<{
    id: number;
    trackingNumber: string;
    toOffice: { name: string };
    priority: 'normal' | 'urgent';
  }>;
}

interface OfficeInfo {
  id: number;
  name: string;
  address: string;
}

const DriverRoute: React.FC = () => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [offices, setOffices] = useState<OfficeInfo[]>([]);
  const [office, setOffice] = useState<OfficeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  // removed date state

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
      setRouteInfo(data);
    } catch (error) {
      message.error('Lỗi khi tải lộ trình');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoute = () => {
    message.info('Tính năng bắt đầu lộ trình đang được phát triển');
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'red' : 'default';
  };

  const getPriorityText = (priority: string) => {
    return priority === 'urgent' ? 'Ưu tiên' : 'Bình thường';
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Lộ trình vận chuyển</Title>
      
      <Row gutter={16}>
        <Col span={24}>

          {routeInfo && routeInfo.fromOffice && (
            <Card title="Chi tiết lộ trình">
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Điểm xuất phát">
                    <Space direction="vertical">
                      <Text strong>{routeInfo.fromOffice?.name}</Text>
                      <Text type="secondary">{routeInfo.fromOffice?.address}</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Điểm đến">
                    {routeInfo.toOffices && routeInfo.toOffices.length > 0 ? (
                      <Space direction="vertical">
                        {routeInfo.toOffices.map((office, index) => (
                          <div key={office.id}>
                            <Text strong>{office.name}</Text>
                            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                              {office.address}
                            </Text>
                          </div>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">Chưa có điểm đến</Text>
                    )}
                  </Card>
                </Col>
              </Row>
              
              {/* Bản đồ Google tĩnh - chỉ hiển thị vị trí đích đến */}
              <div style={{ marginTop: 16 }}>
                <StaticGMap
                  title="Bản đồ vị trí đích đến"
                  query={
                    routeInfo.toOffices && routeInfo.toOffices.length > 0
                      ? routeInfo.toOffices[0]?.address
                      : routeInfo.fromOffice?.address
                  }
                  height={450}
                />
              </div>

              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={8}>
                  <Card size="small">
                    <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
                      <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                      <Text strong>{routeInfo.distance ?? 0} km</Text>
                      <Text type="secondary">Khoảng cách</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
                      <ClockCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                      <Text strong>{routeInfo.estimatedTime ?? 0} giờ</Text>
                      <Text type="secondary">Thời gian dự kiến</Text>
                    </Space>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small">
                    <Space direction="vertical" style={{ textAlign: 'center', width: '100%' }}>
                      <TruckOutlined style={{ fontSize: 24, color: '#faad14' }} />
                      <Text strong>{routeInfo.orders?.length ?? 0}</Text>
                      <Text type="secondary">Số đơn hàng</Text>
                    </Space>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartRoute}
                >
                  Bắt đầu lộ trình
                </Button>
              </div>
            </Card>
          )}

          {!routeInfo && office && (
            <Card title="Vị trí bưu cục cần tới">
              <StaticGMap
                title="Bản đồ bưu cục đích"
                query={office.address || office.name}
                height={450}
              />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Chưa có chuyến vận chuyển hoạt động. Hiển thị vị trí bưu cục đích.</Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DriverRoute;
