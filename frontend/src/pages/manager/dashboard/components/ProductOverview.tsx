import React, { useState } from 'react';
import {
  Card, Button, Typography, Row, Col, Table, Segmented, Tag, Tooltip
} from 'antd';
import {
  ShoppingOutlined, CheckCircleOutlined, ArrowRightOutlined,
  CloseCircleOutlined, PauseCircleOutlined, DownOutlined, UpOutlined
} from '@ant-design/icons';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Chart from './Chart';

const { Title } = Typography;

const COLORS = ['#1C3D90', '#52c41a', '#faad14'];

interface ProductOverviewProps {
  activeProducts: number;
  inactiveProducts: number;
  totalProducts: number;
  outOfStockProducts: number;
  soldByDate: any[];
  productByType: { type: string; total: number }[];
  topSelling: { id: number; name: string; total: number }[];
  topReturned: { id: number; name: string; total: number }[];
}

const ProductOverview: React.FC<ProductOverviewProps> = ({
  activeProducts,
  inactiveProducts,
  totalProducts,
  outOfStockProducts,
  soldByDate,
  productByType,
  topSelling,
  topReturned,
}) => {
  const navigate = useNavigate();
  const [showReturned, setShowReturned] = useState(false);
  const [visible, setVisible] = useState(true);

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: 16,
        marginTop: 24,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: visible ? 16 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'margin 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              backgroundColor: 'rgba(28, 61, 144, 0.1)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShoppingOutlined style={{ fontSize: 20, color: '#1C3D90' }} />
          </div>
          <Title level={4} style={{ color: '#1C3D90', margin: 0 }}>
            Sản phẩm
          </Title>
          {/* Nút toggle hiển thị */}
          <Tooltip title={visible ? 'Ẩn thống kê' : 'Hiện thống kê'}>
            <Button
              shape="circle"
              type="text"
              onClick={() => setVisible(!visible)}
              icon={visible ? <UpOutlined /> : <DownOutlined />}
              style={{
                fontSize: 16,
                color: '#1C3D90',
                transition: 'all 0.2s ease',
              }}
            />
          </Tooltip>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="primary"
            style={{
              backgroundColor: '#1C3D90',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => navigate('/user/products')}
          >
            Xem danh sách
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>

      {/* Nội dung có thể ẩn/hiện */}
      {visible && (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* ===== Hàng 1 ===== */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: '0 0 26%' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Tooltip title="Số lượng sản phẩm có trạng thái 'Active'">
                    <Card bordered={false} hoverable style={{ backgroundColor: '#f6ffed', height: 120, borderRadius: 12 }}>
                      <Title level={5} style={{ margin: 0, color: '#389e0d' }}>Đang bán</Title>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Title level={3} style={{ margin: 0, color: '#389e0d' }}>{activeProducts}</Title>
                        <CheckCircleOutlined style={{ fontSize: 28, color: '#389e0d' }} />
                      </div>
                    </Card>
                  </Tooltip>
                </Col>

                <Col span={12}>
                  <Tooltip title="Số lượng sản phẩm có trạng thái 'Inactive'">
                    <Card bordered={false} hoverable style={{ backgroundColor: '#fff2e8', height: 120, borderRadius: 12 }}>
                      <Title level={5} style={{ margin: 0, color: '#d46b08' }}>Ngừng bán</Title>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Title level={3} style={{ margin: 0, color: '#d46b08' }}>{inactiveProducts}</Title>
                        <PauseCircleOutlined style={{ fontSize: 28, color: '#d46b08' }} />
                      </div>
                    </Card>
                  </Tooltip>
                </Col>

                <Col span={12}>
                  <Tooltip title="Số lượng sản phẩm đã hết hàng (stock = 0)">
                    <Card bordered={false} hoverable style={{ backgroundColor: '#fff1f0', height: 120, borderRadius: 12 }}>
                      <Title level={5} style={{ margin: 0, color: '#cf1322' }}>Hết hàng</Title>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Title level={3} style={{ margin: 0, color: '#cf1322' }}>{outOfStockProducts}</Title>
                        <CloseCircleOutlined style={{ fontSize: 28, color: '#cf1322' }} />
                      </div>
                    </Card>
                  </Tooltip>
                </Col>

                <Col span={12}>
                  <Tooltip title="Số lượng sản phẩm bạn đang có">
                    <Card bordered={false} hoverable style={{ backgroundColor: '#e6f7ff', height: 120, borderRadius: 12 }}>
                      <Title level={5} style={{ margin: 0, color: '#096dd9' }}>Tổng</Title>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                        <Title level={3} style={{ margin: 0, color: '#096dd9' }}>{totalProducts}</Title>
                        <ShoppingOutlined style={{ fontSize: 28, color: '#096dd9' }} />
                      </div>
                    </Card>
                  </Tooltip>
                </Col>
              </Row>
            </div>

            {/* Biểu đồ đường */}
            <div style={{ flex: 1 }}>
              <Card bordered={false} style={{ height: '100%' }}>
                <Chart
                  title="Tổng sản phẩm bán thành công theo thời gian"
                  data={soldByDate}
                  keys={['total']}
                  colors={{ total: '#1C3D90' }}
                />
              </Card>
            </div>
          </div>

          {/* ===== Hàng 2 ===== */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: '0 0 50%' }}>
              <Card>
                <Title level={5} style={{ color: '#1C3D90' }}>Tỷ lệ loại sản phẩm</Title>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productByType}
                      cx="50%"
                      cy="45%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="type"
                      label
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {productByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div style={{ flex: 1 }}>
              <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Title level={5} style={{ margin: 0, color: '#1C3D90' }}>
                    Top 5 sản phẩm theo thời gian
                  </Title>
                  <Segmented
                    options={['Bán chạy', 'Hoàn hàng']}
                    value={showReturned ? 'Hoàn hàng' : 'Bán chạy'}
                    onChange={(value) => setShowReturned(value === 'Hoàn hàng')}
                    style={{ borderRadius: 16 }}
                  />
                </div>

                <Table
                  dataSource={showReturned ? topReturned : topSelling}
                  pagination={false}
                  style={{ marginTop: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}
                  columns={[
                    { title: 'Tên sản phẩm', dataIndex: 'name', ellipsis: true },
                    {
                      title: showReturned ? 'Số lần hoàn' : 'Đã bán',
                      dataIndex: 'total',
                      align: 'center',
                      width: 200,
                      render: (total) => (
                        <Tag color={showReturned ? 'red' : 'green'}>{total}</Tag>
                      ),
                    },
                  ]}
                  rowKey="id"
                  size="small"
                  showHeader
                />
              </Card>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProductOverview;