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
  Modal,
  Checkbox,
  Form
} from 'antd';
import { 
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface CODTransaction {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  codAmount: number;
  status: 'pending' | 'collected' | 'submitted';
  collectedAt?: string;
  submittedAt?: string;
  notes?: string;
}

interface FilterParams {
  status?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
  search?: string;
}

const ShipperCODManagement: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CODTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [summary, setSummary] = useState({
    totalCollected: 0,
    totalSubmitted: 0,
    totalPending: 0,
    transactionCount: 0
  });
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [submitModal, setSubmitModal] = useState(false);
  const [submitForm] = Form.useForm();

useEffect(() => {
  console.log('[CODManagement] Component mounted, fetching transactions...');
  fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pagination.current, pagination.pageSize, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('[CODManagement] Fetching transactions with params:', {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });
      
      const response = await shipperService.getCODTransactions({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      });
      
      console.log('[CODManagement] Response received:', response);
      console.log('[CODManagement] Transactions:', response.transactions);
      console.log('[CODManagement] Summary:', response.summary);
      
      setTransactions(response.transactions);
      setSummary(response.summary);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
      
      console.log('[CODManagement] State updated successfully');
    } catch (error) {
      console.error('[CODManagement] Error fetching COD transactions:', error);
      message.error('Lỗi khi tải danh sách giao dịch COD');
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

  const handleSelectTransaction = (transactionId: number, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, transactionId]);
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSubmitCOD = async (values: any) => {
    try {
      await shipperService.submitCOD({
        transactionIds: selectedTransactions,
        totalAmount: values.totalAmount,
        notes: values.notes
      });
      
      message.success('Đã nộp tiền COD thành công');
      setSubmitModal(false);
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (error) {
      message.error('Lỗi khi nộp tiền COD');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'collected': return 'processing';
      case 'submitted': return 'success';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thu';
      case 'collected': return 'Đã thu';
      case 'submitted': return 'Đã nộp';
      default: return status;
    }
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedTransactions.length === transactions.length && transactions.length > 0}
          indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'select',
      width: 50,
      render: (record: CODTransaction) => (
        <Checkbox
          checked={selectedTransactions.includes(record.id)}
          onChange={(e) => handleSelectTransaction(record.id, e.target.checked)}
        />
      ),
    },
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
      render: (record: CODTransaction) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.recipientName}</Text>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            {record.recipientPhone}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Số tiền COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#f50' }}>
          {amount.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'Đã thu',
      dataIndex: 'codAmount',
      key: 'collectedAmount',
      width: 120,
      render: (amount: number) => (
        <Text style={{ color: '#52c41a' }}>
          {amount.toLocaleString()}đ
        </Text>
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
      title: 'Thời gian thu',
      dataIndex: 'collectedAt',
      key: 'collectedAt',
      width: 150,
      render: (time: string) => (
        time ? (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: '12px' }}>
              {dayjs(time).format('DD/MM/YYYY')}
            </Text>
            <Text style={{ fontSize: '11px', color: '#666' }}>
              {dayjs(time).format('HH:mm')}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">Chưa thu</Text>
        )
      ),
    },
  ];

  const selectedStats = {
    count: selectedTransactions.length,
    totalAmount: transactions
      .filter(t => selectedTransactions.includes(t.id))
      .reduce((sum, t) => sum + t.codAmount, 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý COD</Title>
      
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={summary.transactionCount}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã thu"
              value={summary.totalCollected}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã nộp"
              value={summary.totalSubmitted}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(value) => `${value.toLocaleString()}đ`}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ nộp"
              value={summary.totalPending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
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
              <Option value="pending">Chờ thu</Option>
              <Option value="collected">Đã thu</Option>
              <Option value="submitted">Đã nộp</Option>
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

      {/* Thông tin đã chọn */}
      {selectedTransactions.length > 0 && (
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Space>
                <Text strong>Đã chọn: </Text>
                <Text>{selectedStats.count} giao dịch</Text>
                <Text strong>Tổng tiền: </Text>
                <Text style={{ color: '#f50' }}>
                  {selectedStats.totalAmount.toLocaleString()}đ
                </Text>
              </Space>
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<SwapOutlined />}
                disabled={selectedTransactions.length === 0}
                onClick={() => setSubmitModal(true)}
              >
                Nộp tiền COD ({selectedStats.count})
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Bảng giao dịch */}
      <Card>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao dịch`,
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

      {/* Modal nộp tiền COD */}
      <Modal
        title="Nộp tiền COD"
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        onOk={() => submitForm.submit()}
        width={500}
      >
        <Form
          form={submitForm}
          layout="vertical"
          onFinish={handleSubmitCOD}
        >
          <Form.Item label="Số giao dịch đã chọn">
            <Text>{selectedStats.count} giao dịch</Text>
          </Form.Item>
          
          <Form.Item label="Tổng số tiền">
            <Text strong style={{ fontSize: '18px', color: '#f50' }}>
              {selectedStats.totalAmount.toLocaleString()}đ
            </Text>
          </Form.Item>
          
          <Form.Item
            name="totalAmount"
            label="Số tiền nộp"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền nộp' }]}
          >
            <Input
              type="number"
              placeholder="Nhập số tiền nộp"
              suffix="đ"
            />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShipperCODManagement;