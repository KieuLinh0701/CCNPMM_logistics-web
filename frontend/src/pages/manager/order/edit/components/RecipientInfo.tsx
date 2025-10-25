import React from "react";
import { styles } from "../../../../user/order/style/Order.styles";
import { Card, Col, Form, Input, Row } from "antd";
import { FormInstance } from "antd/lib";
import AddressForm from "../../../../../components/AdressForm";
import { Ward } from "../../../../../types/location";

interface Props {
    form: FormInstance; 
    status: string;
    recipient: {
        name: string;
        phone: string;
        detailAddress: string;
        wardCode: number;
        cityCode: number;
        wardList: Ward[];
    };
    onChange?: (values: any) => void;
}

const RecipientInfo: React.FC<Props> = ({ 
    form, 
    status, 
    recipient, 
    onChange 
}) => {
    return (
        <div style={styles.rowContainerEdit}>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    recipientName: recipient.name,
                    recipientPhone: recipient.phone,
                    recipient: {
                        province: recipient.cityCode,
                        commune: recipient.wardCode,
                        address: recipient.detailAddress,
                    }
                }}
                onValuesChange={(_, allValues) => {
                    onChange?.(allValues); 
                }}
            >
                <Card style={styles.customCard}>
                    <div style={styles.cardTitle}>Thông tin người nhận</div>

                    <Row gutter={16} >
                        <Col span={12}>
                            <Form.Item
                                name="recipientName"
                                label="Tên người nhận"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="recipientPhone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại" },
                                    {
                                        pattern: /^\d{10}$/,
                                        message: "Số điện thoại phải đủ 10 số",
                                    },
                                ]}
                            >
                                <Input placeholder="Ví dụ: 0901234567" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <AddressForm 
                                form={form}
                                prefix="recipient"
                                disableCity={true} 
                            />
                        </Col>
                    </Row>
                </Card>
            </Form>
        </div>
    );
};

export default RecipientInfo;