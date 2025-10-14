import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, message, Spin, Table, Select, Tag, Button } from "antd";
import { DollarOutlined, TruckOutlined } from "@ant-design/icons";
import HeaderHome from "../../components/header/HeaderHome";
import FooterHome from "../../components/footer/FooterHome";
import axios from "axios";

const { Option } = Select;
const { Title, Text } = Typography;

interface ServiceType {
  id: number;
  name: string;
  deliveryTime: string;
}

interface ShippingRate {
  id: number;
  serviceTypeId: number;
  regionType: string;
  weightFrom: number;
  weightTo: number | null;
  price: number;
  unit: number;
  extraPrice: number | null;
  serviceType: ServiceType;
}

const ShippingRates: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, ratesResponse] = await Promise.all([
          axios.get('/api/public/services'),
          axios.get('/api/public/shipping-rates')
        ]);

        if ((servicesResponse.data as any).success) {
          setServices((servicesResponse.data as any).data);
        }

        if ((ratesResponse.data as any).success) {
          setShippingRates((ratesResponse.data as any).data);
        }
      } catch (error) {
        message.error("Không thể tải bảng giá");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRegionTypeText = (regionType: string) => {
    const regionMap: { [key: string]: string } = {
      'Intra-city': 'Nội thành',
      'Intra-region': 'Nội vùng',
      'Near-region': 'Liên vùng gần',
      'Inter-region': 'Liên vùng xa'
    };
    return regionMap[regionType] || regionType;
  };

  const getRegionTypeColor = (regionType: string) => {
    const colorMap: { [key: string]: string } = {
      'Intra-city': 'green',
      'Intra-region': 'blue',
      'Near-region': 'orange',
      'Inter-region': 'red'
    };
    return colorMap[regionType] || 'default';
  };

  const filteredRates = selectedService 
    ? shippingRates.filter(rate => rate.serviceTypeId === selectedService)
    : shippingRates;

  const columns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceType',
      key: 'serviceType',
      render: (serviceType: ServiceType) => (
        <div>
          <Text strong>{serviceType.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {serviceType.deliveryTime}
          </Text>
        </div>
      ),
    },
    {
      title: 'Vùng',
      dataIndex: 'regionType',
      key: 'regionType',
      render: (regionType: string) => (
        <Tag color={getRegionTypeColor(regionType)}>
          {getRegionTypeText(regionType)}
        </Tag>
      ),
    },
    {
      title: 'Khối lượng (kg)',
      key: 'weight',
      render: (record: ShippingRate) => (
        <div>
          {record.weightFrom} - {record.weightTo || '∞'}
        </div>
      ),
    },
    {
      title: 'Giá cơ bản (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => (
        <Text strong style={{ color: '#1C3D90' }}>
          {price.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Phí thêm/kg (VNĐ)',
      dataIndex: 'extraPrice',
      key: 'extraPrice',
      render: (extraPrice: number | null) => (
        extraPrice ? (
          <Text>{extraPrice.toLocaleString()}</Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
  ];

  if (loading) {
    return (
      <div>
        <HeaderHome />
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
        <FooterHome />
      </div>
    );
  }

  return (
    <div>
      <HeaderHome />
      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Bảng giá vận chuyển
        </Title>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={6}>
              <Text strong>Lọc theo dịch vụ:</Text>
            </Col>
            <Col span={12}>
              <Select
                placeholder="Chọn dịch vụ để lọc"
                style={{ width: "100%" }}
                size="large"
                allowClear
                value={selectedService}
                onChange={setSelectedService}
              >
                {services && services.map((service) => (
                  <Option key={service.id} value={service.id}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={6}>
              <Text type="secondary">
                Hiển thị {filteredRates.length} mức giá
              </Text>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={filteredRates}
            rowKey="id"
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} mức giá`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Hướng dẫn sử dụng bảng giá
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div>
                <Title level={4} style={{ color: "#1C3D90" }}>Cách tính phí</Title>
                <ol style={{ fontSize: 16, lineHeight: 2 }}>
                  <li>Chọn dịch vụ phù hợp với nhu cầu</li>
                  <li>Xác định vùng gửi và nhận hàng</li>
                  <li>Đo khối lượng hàng hóa chính xác</li>
                  <li>Tra cứu mức giá tương ứng</li>
                  <li>Cộng thêm phí nếu vượt quá khối lượng cơ bản</li>
                </ol>
              </div>
            </Col>

            <Col span={12}>
              <div>
                <Title level={4} style={{ color: "#1C3D90" }}>Lưu ý quan trọng</Title>
                <ul style={{ fontSize: 16, lineHeight: 2 }}>
                  <li>Giá chưa bao gồm VAT (10%)</li>
                  <li>Phí COD: 2% giá trị hàng hóa</li>
                  <li>Phí bảo hiểm: 0.5% giá trị hàng hóa</li>
                  <li>Phí đóng gói: 10,000 VNĐ/kiện</li>
                  <li>Giá có thể thay đổi theo từng thời điểm</li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Công cụ tính phí nhanh
          </Title>
          
          <Row gutter={[24, 24]} justify="center">
            <Col span={8}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <DollarOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
                <Title level={4}>Tính phí vận chuyển</Title>
                <Text>
                  Tính toán chi phí vận chuyển dựa trên khối lượng, 
                  khoảng cách và loại dịch vụ.
                </Text>
                <br />
                <br />
                <Button 
                  type="primary" 
                  size="large"
                  style={{ background: "#1C3D90" }}
                  onClick={() => window.location.href = '/tracking/shipping-fee'}
                >
                  Tính phí ngay
                </Button>
              </Card>
            </Col>

            <Col span={8}>
              <Card style={{ textAlign: "center", height: "100%" }}>
                <TruckOutlined style={{ fontSize: 48, color: "#1C3D90", marginBottom: 16 }} />
                <Title level={4}>Tra cứu đơn hàng</Title>
                <Text>
                  Theo dõi trạng thái đơn hàng và lịch sử vận chuyển 
                  bằng mã vận đơn.
                </Text>
                <br />
                <br />
                <Button 
                  type="primary" 
                  size="large"
                  style={{ background: "#1C3D90" }}
                  onClick={() => window.location.href = '/tracking/order-tracking'}
                >
                  Tra cứu ngay
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 32 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Chính sách giá
          </Title>
          
          <Row gutter={[24, 24]}>
            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ color: "#52c41a" }}>Giá cạnh tranh</Title>
                <Text>
                  Mức giá được tính toán dựa trên chi phí thực tế và 
                  cạnh tranh trên thị trường.
                </Text>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ color: "#1890ff" }}>Minh bạch</Title>
                <Text>
                  Bảng giá được công khai rõ ràng, không có phí ẩn 
                  hay phí phát sinh bất ngờ.
                </Text>
              </div>
            </Col>

            <Col span={8}>
              <div style={{ textAlign: "center" }}>
                <Title level={4} style={{ color: "#f5222d" }}>Ưu đãi</Title>
                <Text>
                  Nhiều chương trình khuyến mãi và giảm giá cho 
                  khách hàng thân thiết.
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      <FooterHome />
    </div>
  );
};

export default ShippingRates;
