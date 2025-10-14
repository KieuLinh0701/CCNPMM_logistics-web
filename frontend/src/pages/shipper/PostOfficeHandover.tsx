import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Statistic,
  Alert,
  Divider,
  Upload
} from 'antd';
import { 
  InboxOutlined,
  SendOutlined,
  ScanOutlined,
  PrinterOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface PackageItem {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientAddress: string;
  weight: number;
  codAmount: number;
  status: 'ready_for_pickup' | 'picked_up' | 'failed_delivery' | 'returned';
  priority: 'normal' | 'urgent';
  serviceType: string;
  notes?: string;
  returnReason?: string;
  assignedAt?: string;
  returnedAt?: string;
}

interface HandoverSession {
  id: number;
  type: 'pickup' | 'return';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  totalPackages: number;
  confirmedPackages: number;
  notes?: string;
}

const PostOfficeHandover: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pickup' | 'return'>('pickup');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [pickupPackages, setPickupPackages] = useState<PackageItem[]>([]);
  const [returnPackages, setReturnPackages] = useState<PackageItem[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [handoverModal, setHandoverModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [form] = Form.useForm();
  const [currentSession, setCurrentSession] = useState<HandoverSession | null>(null);

  useEffect(() => {
    fetchPackages();
  }, [activeTab]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call for packages
      // For now, set empty arrays
      setPickupPackages([]);
      setReturnPackages([]);
    } catch (error) {
      console.error('Error fetching packages:', error);
      message.error('Lỗi khi tải danh sách kiện hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStartHandover = (type: 'pickup' | 'return') => {
    if (selectedPackages.length === 0) {
      message.warning('Vui lòng chọn ít nhất một kiện hàng');
      return;
    }

    const session: HandoverSession = {
      id: Date.now(),
      type,
      status: 'in_progress',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalPackages: selectedPackages.length,
      confirmedPackages: 0
    };

    setCurrentSession(session);
    setHandoverModal(true);
  };

  const handleConfirmHandover = async (values: any) => {
    try {
      const handoverData = {
        sessionId: currentSession?.id,
        type: activeTab,
        packageIds: selectedPackages,
        notes: values.notes,
        timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      console.log('Handover data:', handoverData);
      
      // TODO: Gọi API xác nhận bàn giao
      
      message.success(
        activeTab === 'pickup' 
          ? 'Đã xác nhận nhận hàng từ bưu cục!' 
          : 'Đã xác nhận trả hàng về bưu cục!'
      );
      
      setHandoverModal(false);
      setSelectedPackages([]);
      setCurrentSession(null);
      form.resetFields();
      fetchPackages();
    } catch (error) {
      console.error('Error confirming handover:', error);
      message.error('Lỗi khi xác nhận bàn giao');
    }
  };

  const handleScanPackage = (trackingNumber: string) => {
    const packageItem = packages.find(p => p.trackingNumber === trackingNumber);
    if (packageItem) {
      const newSelected = selectedPackages.includes(packageItem.id)
        ? selectedPackages.filter(id => id !== packageItem.id)
        : [...selectedPackages, packageItem.id];
      setSelectedPackages(newSelected);
      message.success(`Đã quét ${trackingNumber}`);
    } else {
      message.error('Không tìm thấy kiện hàng');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'blue';
      case 'picked_up': return 'green';
      case 'failed_delivery': return 'red';
      case 'returned': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_for_pickup': return 'Sẵn sàng nhận';
      case 'picked_up': return 'Đã nhận';
      case 'failed_delivery': return 'Giao thất bại';
      case 'returned': return 'Đã trả về';
      default: return status;
    }
  };

  const pickupColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
      render: (text: string, record: PackageItem) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.priority === 'urgent' && <Tag color="red">Ưu tiên</Tag>}
        </Space>
      ),
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      render: (record: PackageItem) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.recipientName}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.recipientAddress}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Khối lượng',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight: number) => `${weight}kg`,
    },
    {
      title: 'COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      render: (amount: number) => (
        <Text style={{ color: amount > 0 ? '#52c41a' : '#8c8c8c' }}>
          {amount > 0 ? `${amount.toLocaleString()}đ` : 'Không'}
        </Text>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    }
  ];

  const returnColumns = [
    ...pickupColumns,
    {
      title: 'Lý do hoàn',
      dataIndex: 'returnReason',
      key: 'returnReason',
      render: (reason: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {reason || 'Không có'}
        </Text>
      ),
    }
  ];

  const rowSelection = {
    selectedRowKeys: selectedPackages,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedPackages(selectedRowKeys as number[]);
    },
    getCheckboxProps: (record: PackageItem) => ({
      disabled: record.status === 'picked_up' || record.status === 'returned',
    }),
  };

  const stats = {
    total: packages.length,
    selected: selectedPackages.length,
    totalWeight: packages
      .filter(p => selectedPackages.includes(p.id))
      .reduce((sum, p) => sum + p.weight, 0),
    totalCOD: packages
      .filter(p => selectedPackages.includes(p.id))
      .reduce((sum, p) => sum + p.codAmount, 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Nhận/Trả hàng tại bưu cục</Title>
      
      {/* Tab chuyển đổi */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card 
            hoverable
            className={activeTab === 'pickup' ? 'active-tab' : ''}
            onClick={() => setActiveTab('pickup')}
            style={{ 
              border: activeTab === 'pickup' ? '2px solid #1890ff' : '1px solid #d9d9d9',
              cursor: 'pointer'
            }}
          >
            <Space>
              <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Nhận hàng từ bưu cục</Title>
                <Text type="secondary">Nhận kiện hàng được phân công giao</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            hoverable
            className={activeTab === 'return' ? 'active-tab' : ''}
            onClick={() => setActiveTab('return')}
            style={{ 
              border: activeTab === 'return' ? '2px solid #1890ff' : '1px solid #d9d9d9',
              cursor: 'pointer'
            }}
          >
            <Space>
              <SendOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>Trả hàng về bưu cục</Title>
                <Text type="secondary">Trả lại các kiện giao thất bại</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Thống kê nhanh */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng kiện hàng"
              value={stats.total}
              prefix={<BoxPlotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Đã chọn"
              value={stats.selected}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng khối lượng"
              value={stats.totalWeight}
              suffix="kg"
              precision={1}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Tổng COD"
              value={stats.totalCOD}
              formatter={(value) => `${value?.toLocaleString()}đ`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Toolbar */}
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <Space>
              <Button 
                type="primary" 
                icon={<ScanOutlined />}
                onClick={() => setScanModal(true)}
              >
                Quét mã vạch
              </Button>
              <Button icon={<PrinterOutlined />}>
                In danh sách
              </Button>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              size="large"
              disabled={selectedPackages.length === 0}
              onClick={() => handleStartHandover(activeTab)}
            >
              {activeTab === 'pickup' ? 'Xác nhận nhận hàng' : 'Xác nhận trả hàng'}
              {selectedPackages.length > 0 && ` (${selectedPackages.length})`}
            </Button>
          </Col>
        </Row>

        {/* Bảng danh sách */}
        <Table
          columns={activeTab === 'pickup' ? pickupColumns : returnColumns}
          dataSource={packages}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} kiện hàng`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal xác nhận bàn giao */}
      <Modal
        title={activeTab === 'pickup' ? 'Xác nhận nhận hàng' : 'Xác nhận trả hàng'}
        open={handoverModal}
        onCancel={() => setHandoverModal(false)}
        footer={null}
        width={600}
      >
        <Alert
          message={
            activeTab === 'pickup' 
              ? 'Xác nhận nhận hàng từ bưu cục'
              : 'Xác nhận trả hàng về bưu cục'
          }
          description={
            activeTab === 'pickup'
              ? 'Vui lòng kiểm tra tình trạng bao bì và số lượng kiện hàng trước khi xác nhận.'
              : 'Vui lòng xác nhận lý do hoàn hàng và tình trạng kiện hàng.'
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleConfirmHandover}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Số kiện hàng"
                value={selectedPackages.length}
                prefix={<BoxPlotOutlined />}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title="Tổng khối lượng"
                value={stats.totalWeight}
                suffix="kg"
                precision={1}
              />
            </Col>
          </Row>

          <Divider />

          <Form.Item label="Ghi chú" name="notes">
            <TextArea
              rows={3}
              placeholder={
                activeTab === 'pickup'
                  ? 'Ghi chú về tình trạng kiện hàng khi nhận...'
                  : 'Ghi chú về tình trạng kiện hàng khi trả...'
              }
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {activeTab === 'pickup' ? 'Xác nhận nhận hàng' : 'Xác nhận trả hàng'}
              </Button>
              <Button size="large" onClick={() => setHandoverModal(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal quét mã vạch */}
      <Modal
        title="Quét mã vạch"
        open={scanModal}
        onCancel={() => setScanModal(false)}
        footer={null}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Nhập hoặc quét mã đơn hàng"
            size="large"
            suffix={<ScanOutlined />}
            onPressEnter={(e) => {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                handleScanPackage(value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            autoFocus
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Nhập mã đơn hàng và nhấn Enter để thêm vào danh sách đã chọn
          </Text>
        </Space>
      </Modal>

      <style>{`
        .active-tab {
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default PostOfficeHandover;

