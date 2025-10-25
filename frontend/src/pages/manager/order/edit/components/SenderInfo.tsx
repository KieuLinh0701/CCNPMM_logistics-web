import React, { useState, useEffect } from "react";
import { Card, Col, Form, Input, Row, Button } from "antd";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";
import { FormInstance } from "antd/lib";
import { Ward } from "../../../../../types/location";
import { styles } from "../../../../user/order/style/Order.styles";
import AddressForm from "../../../../../components/AdressForm";

interface Props {
    form: FormInstance;
    status: string;
    sender: {
        name: string;
        phone: string;
        detailAddress: string;
        wardCode: number;
        cityCode: number;
        wardList: Ward[];
    };
    provinceList?: { code: number; name: string }[];
    wardList?: { code: number; name: string }[];
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
    status,
    sender,
    provinceList = [],
    wardList = [],
    onChange,
}) => {
    const canEdit = ["pending", "confirmed"].includes(status);

    // Giá trị ban đầu
    useEffect(() => {
        form.setFieldsValue({
            senderName: sender.name,
            senderPhone: sender.phone,
            sender: {
                province: sender.cityCode,
                commune: sender.wardCode,
                address: sender.detailAddress,
            },
        });
    }, [form, sender]);

    const handleValuesChange = (_: any, allValues: any) => {
        if (onChange) {
            onChange({
                name: allValues.senderName,
                phone: allValues.senderPhone,
                detailAddress: allValues.sender?.address || "",
                wardCode: allValues.sender?.commune || 0,
                cityCode: allValues.sender?.province || 0,
            });
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
                                    { required: true, message: "Vui lòng nhập tên người gửi" },
                                ]}
                            >
                                <Input disabled={!canEdit}/>
                            </Form.Item>

                            <Form.Item
                                name="senderPhone"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số điện thoại" },
                                    { pattern: /^\d{10}$/, message: "Số điện thoại phải đủ 10 số" },
                                ]}
                            >
                                <Input placeholder="Ví dụ: 0901234567" disabled={!canEdit} />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <AddressForm
                                form={form}
                                prefix="sender"
                                disableCity={true}
                                disableDetailAddress={!canEdit}
                            />
                        </Col>
                    </Row>
                </Card>
            </Form>
        </div>
    );
};

export default SenderInfo;