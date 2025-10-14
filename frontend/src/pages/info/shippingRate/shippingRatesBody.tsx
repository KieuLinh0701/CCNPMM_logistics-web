import React, { useEffect, useState } from "react";
import { Typography, Card, Row, Col, message, Spin, Table, Select, Tag } from "antd";
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

interface ShippingRatesBodyProps {
    // Có thể thêm props nếu cần
}

const ShippingRatesBody: React.FC<ShippingRatesBodyProps> = () => {
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
            title: 'DỊCH VỤ',
            dataIndex: 'serviceType',
            key: 'serviceType',
            width: 200,
            render: (serviceType: ServiceType) => (
                <div>
                    <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
                        {serviceType.name}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        📦 {serviceType.deliveryTime}
                    </Text>
                </div>
            ),
        },
        {
            title: 'VÙNG',
            dataIndex: 'regionType',
            key: 'regionType',
            width: 120,
            render: (regionType: string) => (
                <Tag 
                    color={getRegionTypeColor(regionType)}
                    style={{ 
                        margin: 0, 
                        fontWeight: 500,
                        minWidth: 80,
                        textAlign: 'center'
                    }}
                >
                    {getRegionTypeText(regionType)}
                </Tag>
            ),
        },
        {
            title: 'KHỐI LƯỢNG (KG)',
            key: 'weight',
            width: 140,
            render: (record: ShippingRate) => (
                <Text style={{ fontWeight: 500 }}>
                    {record.weightFrom} - {record.weightTo || '∞'}
                </Text>
            ),
        },
        {
            title: 'GIÁ CƠ BẢN (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            width: 130,
            render: (price: number) => (
                <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                    {price.toLocaleString()}
                </Text>
            ),
        },
        {
            title: 'PHÍ THÊM / 0.5KG (VNĐ)',
            dataIndex: 'extraPrice',
            key: 'extraPrice',
            width: 150,
            render: (extraPrice: number | null) => (
                extraPrice ? (
                    <Text style={{ color: '#fa8c16' }}>
                        {extraPrice.toLocaleString()}
                    </Text>
                ) : (
                    <Text type="secondary" style={{ fontStyle: 'italic' }}>
                        Không áp dụng
                    </Text>
                )
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
                Bảng giá vận chuyển
            </Title>

            {/* Filter Section - Đẹp hơn */}
            <Card 
                style={{ 
                    marginBottom: 24,
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Text strong style={{ fontSize: 15, color: '#1C3D90' }}>
                            🔍 Lọc theo dịch vụ:
                        </Text>
                    </Col>
                    <Col xs={24} sm={16} md={12}>
                        <Select
                            placeholder="Chọn dịch vụ để lọc..."
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
                    <Col xs={24} sm={24} md={6}>
                        <Text 
                            style={{ 
                                color: '#1890ff',
                                fontSize: 14,
                                fontWeight: 500
                            }}
                        >
                            Hiển thị {filteredRates.length} mức giá
                        </Text>
                    </Col>
                </Row>
            </Card>

            {/* Table - Đẹp hơn */}
            <Card
                style={{
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <Table
                    columns={columns}
                    dataSource={filteredRates}
                    rowKey="id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `📋 ${range[0]}-${range[1]} của ${total} mức giá`,
                    }}
                    scroll={{ x: 800 }}
                    size="middle"
                />
            </Card>

            {/* Information Section - Có màu đẹp hơn */}
            <Card 
                style={{ 
                    marginTop: 32,
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)'
                }}
            >
                <Title 
                    level={3} 
                    style={{ 
                        textAlign: "center", 
                        marginBottom: 24,
                        color: "#1C3D90"
                    }}
                >
                    Hướng dẫn sử dụng bảng giá
                </Title>

                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <div style={{ padding: '0 16px' }}>
                            <Title 
                                level={4} 
                                style={{ 
                                    color: "#1890ff",
                                    borderBottom: '2px solid #1890ff',
                                    paddingBottom: 8,
                                    marginBottom: 16
                                }}
                            >
                                📋Cách tính phí
                            </Title>
                            <ol style={{ 
                                fontSize: 15, 
                                lineHeight: 2,
                                color: '#333',
                                paddingLeft: 20
                            }}>
                                <li>Chọn dịch vụ phù hợp với nhu cầu</li>
                                <li>Xác định vùng gửi và nhận hàng</li>
                                <li>Đo khối lượng hàng hóa chính xác</li>
                                <li>Tra cứu mức giá tương ứng</li>
                                <li>Cộng thêm phí nếu vượt quá khối lượng cơ bản</li>
                            </ol>
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <div style={{ padding: '0 16px' }}>
                            <Title 
                                level={4} 
                                style={{ 
                                    color: "#fa8c16",
                                    borderBottom: '2px solid #fa8c16',
                                    paddingBottom: 8,
                                    marginBottom: 16
                                }}
                            >
                                ⚠️ Lưu ý quan trọng
                            </Title>
                            <ul style={{ 
                                fontSize: 15, 
                                lineHeight: 2,
                                color: '#333',
                                paddingLeft: 20
                            }}>
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
        </div>
    );
};

export default ShippingRatesBody;