import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Divider,
  message,
  Spin,
  Tabs
} from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  PercentageOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';
import financialAPI, { FinancialStats, ReconciliationHistory } from '../../services/financialService';
import { adminAPI } from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const FinancialManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [reconciliationHistory, setReconciliationHistory] = useState<ReconciliationHistory | null>(null);
  const [offices, setOffices] = useState<any[]>([]);
  
  // Filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<number | undefined>();
  const [regionType, setRegionType] = useState<string | undefined>();

  useEffect(() => {
    fetchOffices();
    fetchFinancialStats();
  }, []);

  const fetchOffices = async () => {
    try {
      const response = await adminAPI.listPostOffices({ page: 1, limit: 100 });
      setOffices(response.data || []);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (dateRange) {
        filters.startDate = dateRange[0].format('YYYY-MM-DD');
        filters.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (selectedOffice) {
        filters.officeId = selectedOffice;
      }
      
      if (regionType) {
        filters.regionType = regionType;
      }

      const response = await financialAPI.getFinancialStats(filters);
      if (response.success) {
        setFinancialStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching financial stats:', error);
      message.error('Lỗi khi tải thống kê tài chính');
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliationHistory = async () => {
    try {
      setLoading(true);
      const filters: any = { page: 1, limit: 10 };
      
      if (dateRange) {
        filters.startDate = dateRange[0].format('YYYY-MM-DD');
        filters.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (selectedOffice) {
        filters.officeId = selectedOffice;
      }

      const response = await financialAPI.getReconciliationHistory(filters);
      if (response.success) {
        setReconciliationHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching reconciliation history:', error);
      message.error('Lỗi khi tải lịch sử đối soát');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    fetchFinancialStats();
    fetchReconciliationHistory();
  };

  const exportToExcel = async () => {
    if (!financialStats) {
      message.warning('Không có dữ liệu để xuất báo cáo');
      return;
    }

    try {
      setLoading(true);
      const blob = await financialAPI.exportToExcel(financialStats);
      
      // Tạo URL và tải file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất file Excel thành công');
    } catch (error) {
      console.error('Export Excel error:', error);
      message.error('Lỗi khi xuất file Excel');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!financialStats) {
      message.warning('Không có dữ liệu để xuất báo cáo');
      return;
    }

    try {
      setLoading(true);
      const blob = await financialAPI.exportToPDF(financialStats);
      
      // Tạo URL và tải file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất file PDF thành công');
    } catch (error) {
      console.error('Export PDF error:', error);
      message.error('Lỗi khi xuất file PDF');
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const monthlyData = financialStats?.monthlyStats || [];
  const officeData = financialStats?.officeStats || [];
  const serviceTypeData = financialStats?.serviceTypeStats || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value: number) => `${value.toLocaleString()}đ`;

  const reconciliationColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
    },
    {
      title: 'Người nhận',
      key: 'recipient',
      render: (record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.recipientName}</Text>
          <Text type="secondary">{record.recipientPhone}</Text>
        </Space>
      ),
    },
    {
      title: 'Bưu cục',
      dataIndex: ['toOffice', 'name'],
      key: 'office',
    },
    {
      title: 'COD',
      dataIndex: 'cod',
      key: 'cod',
      render: (value: number) => (
        <Text strong style={{ color: value > 0 ? '#52c41a' : '#8c8c8c' }}>
          {value > 0 ? `${value.toLocaleString()}đ` : 'Không'}
        </Text>
      ),
    },
    {
      title: 'Phí vận chuyển',
      dataIndex: 'shippingFee',
      key: 'shippingFee',
      render: (value: number) => `${value.toLocaleString()}đ`,
    },
    {
      title: 'Tổng thu',
      key: 'totalRevenue',
      render: (record: any) => (
        <Text strong style={{ color: '#1890ff' }}>
          {(record.cod + record.shippingFee - record.discountAmount).toLocaleString()}đ
        </Text>
      ),
    },
    {
      title: 'Ngày giao',
      dataIndex: 'deliveredAt',
      key: 'deliveredAt',
      render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng quan',
      children: (
        <div>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={financialStats?.summary.totalOrders || 0}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={financialStats?.summary.totalRevenue || 0}
                  prefix={<DollarOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="COD đã thu"
                  value={financialStats?.summary.codCollected || 0}
                  prefix={<DollarOutlined />}
                  suffix="đ"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Tỷ lệ thành công"
                  value={financialStats?.summary.successRate || 0}
                  prefix={<PercentageOutlined />}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Doanh thu theo tháng" extra={<BarChartOutlined />}>
                <LineChart width={400} height={300} data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']} />
                  <Legend />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#1890ff" strokeWidth={2} />
                </LineChart>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Doanh thu theo bưu cục" extra={<BarChartOutlined />}>
                <BarChart width={400} height={300} data={officeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="toOffice.name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']} />
                  <Bar dataKey="totalRevenue" fill="#52c41a" />
                </BarChart>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <Card title="Doanh thu theo loại dịch vụ" extra={<PieChartOutlined />}>
                <PieChart width={400} height={300}>
                  <Pie
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent = 0 } = props || {};
                      return `${name} ${(percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRevenue"
                  >
                    {serviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Doanh thu']} />
                </PieChart>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Chi tiết thu chi">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Phí vận chuyển đã thu:</Text>
                    <Text style={{ float: 'right', color: '#52c41a' }}>
                      {(financialStats?.summary.shippingFeeCollected || 0).toLocaleString()}đ
                    </Text>
                  </div>
                  <div>
                    <Text strong>Tổng giảm giá:</Text>
                    <Text style={{ float: 'right', color: '#f50' }}>
                      -{(financialStats?.summary.totalDiscount || 0).toLocaleString()}đ
                    </Text>
                  </div>
                  <Divider />
                  <div>
                    <Text strong style={{ fontSize: 16 }}>Tổng thu thực tế:</Text>
                    <Text strong style={{ float: 'right', fontSize: 16, color: '#1890ff' }}>
                      {(financialStats?.summary.totalRevenue || 0).toLocaleString()}đ
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'reconciliation',
      label: 'Đối soát',
      children: (
        <div>
          <Card title="Lịch sử đối soát" extra={
            <Space>
              <Button icon={<FileExcelOutlined />} onClick={exportToExcel}>
                Xuất Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={exportToPDF}>
                Xuất PDF
              </Button>
            </Space>
          }>
            <Table
              columns={reconciliationColumns}
              dataSource={reconciliationHistory?.orders || []}
              rowKey="id"
              pagination={{
                current: 1,
                pageSize: 10,
                total: reconciliationHistory?.pagination.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
            
            {reconciliationHistory?.summary && (
              <Card size="small" style={{ marginTop: 16, backgroundColor: '#f0f2f5' }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="Tổng đơn đã giao"
                      value={reconciliationHistory.summary.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tổng COD"
                      value={reconciliationHistory.summary.totalCOD}
                      prefix={<DollarOutlined />}
                      suffix="đ"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tổng phí vận chuyển"
                      value={reconciliationHistory.summary.totalShippingFee}
                      prefix={<TruckOutlined />}
                      suffix="đ"
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Tổng thu"
                      value={reconciliationHistory.summary.totalRevenue}
                      prefix={<DollarOutlined />}
                      suffix="đ"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý dòng tiền & Báo cáo</Title>
      
      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Text strong>Khoảng thời gian:</Text>
            <RangePicker
              style={{ width: '100%', marginTop: 4 }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text strong>Bưu cục:</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Tất cả bưu cục"
              value={selectedOffice}
              onChange={setSelectedOffice}
              allowClear
            >
              {offices.map(office => (
                <Option key={office.id} value={office.id}>
                  {office.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Text strong>Khu vực:</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              placeholder="Tất cả khu vực"
              value={regionType}
              onChange={setRegionType}
              allowClear
            >
              <Option value="urban">Nội thành</Option>
              <Option value="suburban">Ngoại thành</Option>
              <Option value="intercity">Liên tỉnh</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Button type="primary" onClick={handleFilterChange} loading={loading}>
              Lọc dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Spin spinning={loading}>
        <Tabs items={tabItems} />
      </Spin>
    </div>
  );
};

export default FinancialManagement;
