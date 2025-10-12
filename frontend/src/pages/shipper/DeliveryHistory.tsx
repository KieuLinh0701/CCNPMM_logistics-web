import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  Input,
  Statistic,
  message,
  Image,
  Modal
} from 'antd';
import { 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface DeliveryRecord {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
  proofImages?: string[];
  actualRecipient?: string;
  actualRecipientPhone?: string;
  codCollected?: number;
}

interface FilterParams {
  status?: string;
  route?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  search?: string;
}

const ShipperDeliveryHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [stats, setStats] = useState({
    totalAssigned: 0,
    inProgress: 0,
    delivered: 0,
    failed: 0,
    codCollected: 0
  });
  const [selectedRecord, setSelectedRecord] = useState<DeliveryRecord | null>(null);
  const [detailModal, setDetailModal] = useState(false);

useEffect(() => {
  fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pagination.current, pagination.pageSize, filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await shipperService.getDeliveryHistory({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });
      
      setHistory(response.orders);
      setStats(response.stats);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      message.error('Lỗi khi tải lịch sử giao hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleViewDetail = (record: DeliveryRecord) => {
    setSelectedRecord(record);
    setDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'blue';
      case 'picked_up': return 'orange';
      case 'in_transit': return 'processing';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      case 'failed': return 'error';
      case 'returned': return 'warning';
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
      case 'failed': return 'Giao thất bại';
      case 'returned': return 'Đã hoàn';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      width: 140,
      render: (text: string) => (
        <Text strong style={{ fontSize: '13px' }}>{text}</Text>
      ),
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      width: 200,
      render: (record: DeliveryRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.recipientName}</Text>
          <Space size={4}>
            <PhoneOutlined style={{ fontSize: '12px', color: '#666' }} />
            <Text style={{ fontSize: '12px' }}>{record.recipientPhone}</Text>
          </Space>
          <Text style={{ fontSize: '11px', color: '#666' }} ellipsis>
            {record.recipientAddress}
          </Text>
        </Space>
      ),
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      width: 120,
      render: (amount: number) => (
        amount > 0 ? (
          <Text strong style={{ color: '#f50' }}>
            {amount.toLocaleString()}đ
          </Text>
        ) : (
          <Text type="secondary">Không COD</Text>
        )
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Text>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (record: DeliveryRecord) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Lịch sử giao hàng</Title>
      
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.totalAssigned}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã giao"
              value={stats.delivered}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thất bại"
              value={stats.failed}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="COD đã thu"
              value={stats.codCollected}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="delivered">Đã giao</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="returned">Đã hoàn</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange('dateRange', dates)}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={resetFilters}>
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Bảng lịch sử */}
      <Card>
        <Table
          columns={columns}
          dataSource={history}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bản ghi`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10
              }));
            }
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết giao hàng"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedRecord && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Mã đơn hàng: </Text>
                <Text>{selectedRecord.trackingNumber}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái: </Text>
                <Tag color={getStatusColor(selectedRecord.status)}>
                  {getStatusText(selectedRecord.status)}
                </Tag>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Người nhận: </Text>
                <Text>{selectedRecord.recipientName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Số điện thoại: </Text>
                <Text>{selectedRecord.recipientPhone}</Text>
              </Col>
            </Row>
            
            <div>
              <Text strong>Địa chỉ: </Text>
              <Text>{selectedRecord.recipientAddress}</Text>
            </div>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>COD: </Text>
                <Text style={{ color: '#f50' }}>
                  {selectedRecord.codAmount > 0 ? `${selectedRecord.codAmount.toLocaleString()}đ` : 'Không COD'}
                </Text>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Ngày tạo: </Text>
                <Text>{dayjs(selectedRecord.createdAt).format('DD/MM/YYYY')}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Giờ tạo: </Text>
                <Text>{dayjs(selectedRecord.createdAt).format('HH:mm')}</Text>
              </Col>
            </Row>
            
            {selectedRecord.actualRecipient && (
              <div>
                <Text strong>Người nhận thực tế: </Text>
                <Text>{selectedRecord.actualRecipient}</Text>
              </div>
            )}
            
            {selectedRecord.notes && (
              <div>
                <Text strong>Ghi chú: </Text>
                <Text>{selectedRecord.notes}</Text>
              </div>
            )}
            
            {selectedRecord.proofImages && selectedRecord.proofImages.length > 0 && (
              <div>
                <Text strong>Hình ảnh minh chứng: </Text>
                <div style={{ marginTop: '8px' }}>
                  <Image.PreviewGroup>
                    {selectedRecord.proofImages.map((image, index) => (
                      <Image
                        key={index}
                        width={100}
                        height={100}
                        src={image}
                        style={{ marginRight: '8px', marginBottom: '8px' }}
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ShipperDeliveryHistory;