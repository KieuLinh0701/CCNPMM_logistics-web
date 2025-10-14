import React from "react";
import { Typography, Card, Row, Col } from "antd";

const { Title, Text } = Typography;

const ShippingRatesPolicies: React.FC = () => {
    return (
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
    );
};

export default ShippingRatesPolicies;