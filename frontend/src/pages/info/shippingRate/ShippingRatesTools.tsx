import React from "react";
import { Typography, Card, Row, Col, Button } from "antd";
import { DollarOutlined, TruckOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ShippingRatesTools: React.FC = () => {
    return (
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
    );
};

export default ShippingRatesTools;