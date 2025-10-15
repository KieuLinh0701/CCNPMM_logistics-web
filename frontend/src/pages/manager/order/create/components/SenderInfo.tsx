import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styles } from "../../../../user/order/style/Order.styles";
import { City, Ward } from "../../../../../types/location";
import { Card, Col, Form, Input, Row } from "antd";
import AddressForm from "../../../../../components/AdressForm";
import { FormInstance } from "antd/lib";

interface Props {
    form: FormInstance;
    sender: {
        name: string;
        phone: string;
        detailAddress: string;
        wardCode: number;
        cityCode: number;
    };
    cityList?: City[];
    wardList?: Ward[];
    onChange?: (newSender: {
        name: string;
        phone: string;
        detailAddress: string;
        wardCode: number;
        cityCode: number;
    }) => void;
}

const SenderInfo: React.FC<Props> = ({
    form,
    sender,
    cityList = [],
    wardList = [],
    onChange,
}) => {

    const senderFormValues = {
        senderName: sender.name,
        senderPhone: sender.phone,
        sender: {
            province: sender.cityCode,
            commune: sender.wardCode,
            address: sender.detailAddress,
        },
    };

    const handleValuesChange = (_: any, allValues: any) => {
        const newValues = {
            name: allValues.senderName || "",
            phone: allValues.senderPhone || "",
            detailAddress: allValues.sender?.address || "",
            wardCode: allValues.sender?.commune || 0,
            cityCode: allValues.sender?.province || 0,
        };

        if (onChange) {
            onChange(newValues);
        }
    };

    return (
        <div style={styles.rowContainerEdit}>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
            >
                <Card style={styles.customCard}>
                    <div style={styles.cardTitle}>Thông tin người gửi</div>
                    <Row gutter={16} style={{ marginTop: 30 }}>
                        <Col span={12}>
                            <Form.Item
                                name="senderName"
                                label="Tên người gửi"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập tên người gửi",
                                    },
                                ]}
                                validateTrigger={['onChange', 'onBlur']}
                            >
                                <Input placeholder="Nhập tên người gửi" />
                            </Form.Item>

                            <Form.Item
                                name="senderPhone"
                                label="Số điện thoại"
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng nhập số điện thoại",
                                    },
                                    {
                                        pattern: /^\d{10}$/,
                                        message: "Số điện thoại phải đủ 10 số",
                                    },
                                ]}
                                validateTrigger={['onChange', 'onBlur']}
                            >
                                <Input placeholder="Ví dụ: 0901234567" />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <AddressForm
                                form={form}
                                prefix="sender"
                                disableCity={false}
                            />
                        </Col>
                    </Row>
                </Card>
            </Form>
        </div >
    );
};

export default SenderInfo;