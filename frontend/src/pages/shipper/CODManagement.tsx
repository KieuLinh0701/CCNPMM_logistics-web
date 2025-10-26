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
  Form,
  Tabs,
  Descriptions
} from 'antd';
import { 
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  BankOutlined,
  HistoryOutlined,
  EyeOutlined
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

interface CODSubmission {
  id: number;
  orderId: number;
  officeId: number;
  shipperId: number;
  amountSubmitted: number;
  discrepancy: number;
  status: 'Pending' | 'Confirmed' | 'Adjusted' | 'Rejected';
  notes: string;
  reconciledAt?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    id: number;
    trackingNumber: string;
    recipientName: string;
    cod: number;
  };
  orders?: {
    id: number;
    trackingNumber: string;
    recipientName: string;
    cod: number;
  }[];
  office?: {
    id: number;
    name: string;
    address: string;
  };
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
  const [activeTab, setActiveTab] = useState('transactions');
  const [submissions, setSubmissions] = useState<CODSubmission[]>([]);
  const [submissionSummary, setSubmissionSummary] = useState({
    totalSubmitted: 0,
    totalDiscrepancy: 0,
    totalSubmissions: 0
  });
  const [submissionPagination, setSubmissionPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [submissionFilters, setSubmissionFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CODSubmission | null>(null);

  // Debug logging
  console.log('[CODManagement] Current transactions state:', transactions);
  console.log('[CODManagement] Transactions length:', transactions.length);

  useEffect(() => {
    console.log('[CODManagement] Component mounted, fetching transactions...');
    fetchTransactions();
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab, submissionPagination.page, submissionPagination.limit, submissionFilters]);

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
      
      console.log('[CODManagement] Raw response:', response);
      console.log('[CODManagement] Transactions data:', response.transactions);
      console.log('[CODManagement] First transaction:', response.transactions[0]);
      setTransactions(response.transactions);
      setSummary(response.summary);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total
      }));
    } catch (error) {
      console.error('[CODManagement] Error fetching transactions:', error);
      message.error('Lỗi khi tải danh sách giao dịch COD');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = {
        page: submissionPagination.page,
        limit: submissionPagination.limit,
        ...submissionFilters
      };
      
      const response = await shipperService.getCODSubmissionHistory(params);
      console.log('[CODManagement] COD submission response:', response);
      console.log('[CODManagement] Submissions data:', response.submissions);
      console.log('[CODManagement] Summary data:', response.summary);
      console.log('[CODManagement] Pagination data:', response.pagination);
      console.log('[CODManagement] First submission sample:', response.submissions[0]);
      setSubmissions(response.submissions);
      setSubmissionSummary(response.summary);
      setSubmissionPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching COD submissions:', error);
      message.error('Lỗi khi tải lịch sử nộp tiền COD');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmissionFilterChange = (key: string, value: any) => {
    setSubmissionFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setSubmissionPagination(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const handleSubmitCOD = async (values: any) => {
    try {
      setLoading(true);
      
      if (selectedTransactions.length === 0) {
        message.error('Vui lòng chọn ít nhất một giao dịch COD');
        return;
      }

      await shipperService.submitCOD({
        transactionIds: selectedTransactions,
        totalAmount: values.totalAmount,
        notes: values.notes
      });

      message.success('Đã nộp tiền COD thành công');
      setSubmitModal(false);
      submitForm.resetFields();
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (error) {
      console.error('Error submitting COD:', error);
      message.error('Lỗi khi nộp tiền COD');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return selectedTransactions.reduce((total, transactionId) => {
      const transaction = transactions.find(t => t.id === transactionId);
      return total + (transaction?.codAmount || 0);
    }, 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Chỉ chọn đơn hàng có COD > 0
      setSelectedTransactions(transactions.filter(t => t.codAmount > 0).map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleViewDetail = (submission: CODSubmission) => {
    setSelectedSubmission(submission);
    setDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'collected': return 'processing';
      case 'submitted': return 'success';
      case 'delivered': return 'blue';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thu';
      case 'collected': return 'Đã thu';
      case 'submitted': return 'Đã nộp';
      case 'delivered': return 'Đã giao';
      default: return status;
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'orange';
      case 'Confirmed': return 'success';
      case 'Adjusted': return 'blue';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  };

  const getSubmissionStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return 'Chờ xác nhận';
      case 'Confirmed': return 'Đã xác nhận';
      case 'Adjusted': return 'Có điều chỉnh';
      case 'Rejected': return 'Từ chối';
      default: return status;
    }
  };

  const submissionColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orders',
      key: 'trackingNumbers',
      width: 140,
      render: (orders: any[]) => (
        <div>
          {orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <div key={order.id}>
                <Text strong style={{ fontSize: '13px' }}>
                  {order.trackingNumber}
                </Text>
                {index < orders.length - 1 && <br />}
              </div>
            ))
          ) : (
            <Text style={{ color: '#999' }}>N/A</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Người nhận',
      dataIndex: 'orders',
      key: 'recipientNames',
      width: 150,
      render: (orders: any[]) => (
        <div>
          {orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <div key={order.id}>
                <Text>{order.recipientName}</Text>
                {index < orders.length - 1 && <br />}
              </div>
            ))
          ) : (
            <Text style={{ color: '#999' }}>N/A</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Số tiền nộp',
      dataIndex: 'amountSubmitted',
      key: 'amountSubmitted',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'Chênh lệch',
      dataIndex: 'discrepancy',
      key: 'discrepancy',
      width: 100,
      render: (discrepancy: number) => (
        <Text style={{ 
          color: discrepancy === 0 ? '#52c41a' : discrepancy > 0 ? '#1890ff' : '#ff4d4f' 
        }}>
          {discrepancy === 0 ? 'Khớp' : `${discrepancy > 0 ? '+' : ''}${discrepancy.toLocaleString()}đ`}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getSubmissionStatusColor(status)}>
          {getSubmissionStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Bưu cục',
      dataIndex: ['office', 'name'],
      key: 'officeName',
      width: 150,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time: string) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(time).format('DD/MM/YYYY')}
          </Text>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {dayjs(time).format('HH:mm')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_: any, record: CODSubmission) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedTransactions.length === transactions.filter(t => t.codAmount > 0).length && transactions.filter(t => t.codAmount > 0).length > 0}
          indeterminate={selectedTransactions.length > 0 && selectedTransactions.length < transactions.filter(t => t.codAmount > 0).length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'select',
      width: 50,
      render: (record: CODTransaction) => (
        <Checkbox
          checked={selectedTransactions.includes(record.id)}
          disabled={record.codAmount === 0} // Không cho chọn đơn hàng không có COD
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTransactions(prev => [...prev, record.id]);
            } else {
              setSelectedTransactions(prev => prev.filter(id => id !== record.id));
            }
          }}
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
      dataIndex: 'recipientName',
      key: 'recipientName',
      width: 150,
    },
    {
      title: 'Số tiền COD',
      dataIndex: 'codAmount',
      key: 'codAmount',
      width: 120,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {amount.toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày thu',
      dataIndex: 'collectedAt',
      key: 'collectedAt',
      width: 150,
      render: (time: string) => time ? (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(time).format('DD/MM/YYYY')}
          </Text>
          <Text style={{ fontSize: '11px', color: '#666' }}>
            {dayjs(time).format('HH:mm')}
          </Text>
        </Space>
      ) : '-',
    },
  ];

  const selectedStats = {
    count: selectedTransactions.length,
    total: selectedTransactions
      .map(id => transactions.find(t => t.id === id))
      .filter(Boolean)
      .reduce((sum, t) => sum + (t?.codAmount || 0), 0)
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý COD</Title>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: 'transactions',
            label: 'Giao dịch COD',
            children: (
              <>
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
                <Card style={{ marginBottom: '16px' }}>
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
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Input
                        placeholder="Tìm kiếm theo mã đơn hàng"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                      <Button onClick={resetFilters}>Xóa bộ lọc</Button>
                    </Col>
                  </Row>
                </Card>

                {/* Bảng giao dịch */}
                <Card>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>Danh sách giao dịch COD</Text>
                      {selectedTransactions.length > 0 && (
                        <Text style={{ marginLeft: '16px', color: '#1890ff' }}>
                          Đã chọn {selectedTransactions.length} giao dịch
                        </Text>
                      )}
                    </div>
                    {selectedTransactions.length > 0 && (
                      <Button
                        type="primary"
                        icon={<BankOutlined />}
                        onClick={() => setSubmitModal(true)}
                      >
                        Nộp tiền COD ({selectedStats.count})
                      </Button>
                    )}
                  </div>
                  
                  <Table
                    columns={columns}
                    dataSource={transactions}
                    loading={loading}
                    rowKey="id"
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
                      },
                    }}
                  />
                </Card>
              </>
            )
          },
          {
            key: 'submissions',
            label: 'Lịch sử nộp COD',
            children: (
              <>
                {/* Summary Cards */}
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Tổng số tiền đã nộp"
                        value={submissionSummary.totalSubmitted}
                        prefix={<DollarOutlined />}
                        suffix="đ"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Tổng chênh lệch"
                        value={submissionSummary.totalDiscrepancy}
                        prefix={<DollarOutlined />}
                        suffix="đ"
                        valueStyle={{ 
                          color: submissionSummary.totalDiscrepancy === 0 ? '#52c41a' : '#1890ff' 
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="Số lần nộp"
                        value={submissionSummary.totalSubmissions}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Filters */}
                <Card style={{ marginBottom: '16px' }}>
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Select
                        placeholder="Trạng thái"
                        allowClear
                        style={{ width: '100%' }}
                        value={submissionFilters.status}
                        onChange={(value) => handleSubmissionFilterChange('status', value)}
                      >
                        <Option value="Pending">Chờ xác nhận</Option>
                        <Option value="Confirmed">Đã xác nhận</Option>
                        <Option value="Adjusted">Có điều chỉnh</Option>
                        <Option value="Rejected">Từ chối</Option>
                      </Select>
                    </Col>
                    <Col span={8}>
                      <RangePicker
                        style={{ width: '100%' }}
                        onChange={(dates) => {
                          if (dates) {
                            handleSubmissionFilterChange('dateFrom', dates[0]?.format('YYYY-MM-DD'));
                            handleSubmissionFilterChange('dateTo', dates[1]?.format('YYYY-MM-DD'));
                          } else {
                            handleSubmissionFilterChange('dateFrom', '');
                            handleSubmissionFilterChange('dateTo', '');
                          }
                        }}
                      />
                    </Col>
                    <Col span={4}>
                      <Button
                        type="primary"
                        icon={<HistoryOutlined />}
                        onClick={fetchSubmissions}
                      >
                        Tìm kiếm
                      </Button>
                    </Col>
                  </Row>
                </Card>

                {/* Table */}
                <Card>
                  <Table
                    columns={submissionColumns}
                    dataSource={submissions}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                      current: submissionPagination.page,
                      pageSize: submissionPagination.limit,
                      total: submissionPagination.total,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} bản ghi`,
                      onChange: (page, pageSize) => {
                        setSubmissionPagination(prev => ({
                          ...prev,
                          page,
                          limit: pageSize || 10
                        }));
                      },
                    }}
                  />
                </Card>
              </>
            )
          }
        ]}
      />

      {/* Modal nộp tiền COD */}
      <Modal
        title="Nộp tiền COD"
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        onOk={() => submitForm.submit()}
        width={600}
        confirmLoading={loading}
      >
        <Form
          form={submitForm}
          layout="vertical"
          onFinish={handleSubmitCOD}
        >
          <Form.Item
            name="totalAmount"
            label="Số tiền nộp"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền nộp' }]}
            initialValue={calculateTotalAmount()}
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

      {/* Detail Modal */}
      <Modal
        title="Chi tiết nộp tiền COD"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedSubmission && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã đơn hàng">
              {selectedSubmission.orders && selectedSubmission.orders.length > 0 ? (
                <div>
                  {selectedSubmission.orders.map((order: any, index: number) => (
                    <div key={order.id}>
                      <Text strong>{order.trackingNumber}</Text>
                      {index < (selectedSubmission.orders?.length || 0) - 1 && <br />}
                    </div>
                  ))}
                </div>
              ) : (
                <Text style={{ color: '#999' }}>N/A</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Người nhận">
              {selectedSubmission.orders && selectedSubmission.orders.length > 0 ? (
                <div>
                  {selectedSubmission.orders.map((order: any, index: number) => (
                    <div key={order.id}>
                      <Text>{order.recipientName}</Text>
                      {index < (selectedSubmission.orders?.length || 0) - 1 && <br />}
                    </div>
                  ))}
                </div>
              ) : (
                <Text style={{ color: '#999' }}>N/A</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền COD">
              {selectedSubmission.orders && selectedSubmission.orders.length > 0 ? (
                <div>
                  {selectedSubmission.orders.map((order: any, index: number) => (
                    <div key={order.id}>
                      <Text strong>{order.cod?.toLocaleString()}đ</Text>
                      {index < (selectedSubmission.orders?.length || 0) - 1 && <br />}
                    </div>
                  ))}
                </div>
              ) : (
                <Text style={{ color: '#999' }}>N/A</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền nộp">
              <Text strong style={{ color: '#52c41a' }}>
                {selectedSubmission.amountSubmitted.toLocaleString()}đ
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chênh lệch">
              <Text style={{ 
                color: selectedSubmission.discrepancy === 0 ? '#52c41a' : 
                       selectedSubmission.discrepancy > 0 ? '#1890ff' : '#ff4d4f' 
              }}>
                {selectedSubmission.discrepancy === 0 ? 'Khớp' : 
                 `${selectedSubmission.discrepancy > 0 ? '+' : ''}${selectedSubmission.discrepancy.toLocaleString()}đ`}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getSubmissionStatusColor(selectedSubmission.status)}>
                {getSubmissionStatusText(selectedSubmission.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bưu cục">
              {selectedSubmission.office?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày nộp">
              {dayjs(selectedSubmission.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            {selectedSubmission.reconciledAt && (
              <Descriptions.Item label="Ngày xác nhận">
                {dayjs(selectedSubmission.reconciledAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ghi chú">
              {selectedSubmission.notes || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ShipperCODManagement;