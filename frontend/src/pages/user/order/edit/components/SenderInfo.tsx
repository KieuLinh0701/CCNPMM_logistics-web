import React, { useState, useEffect } from "react";
import { styles } from "../../style/Order.styles";
import { Ward } from "../../../../../types/location";
import { Card, Col, Form, Input, Row, Button } from "antd";
import AddressForm from "../../../../../components/AdressForm";
import { EditOutlined, RollbackOutlined } from "@ant-design/icons";
import { FormInstance } from "antd/lib";

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
    user?: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
        detailAddress: string;
        codeWard: number;
        codeCity: number;
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
    user,
    provinceList = [],
    wardList = [],
    onChange,
}) => {
    const [editing, setEditing] = useState(false);
    const [useUserView, setUseUserView] = useState(true);

    const senderFormValues = {
        senderName: sender.name,
        senderPhone: sender.phone,
        sender: {
            province: sender.cityCode,
            commune: sender.wardCode,
            address: sender.detailAddress,
        },
    };

    const userFormValues = user
        ? {
            senderName: `${user.lastName} ${user.firstName}`,
            senderPhone: user.phoneNumber,
            sender: {
                province: user.codeCity,
                commune: user.codeWard,
                address: user.detailAddress,
            },
        }
        : senderFormValues;

    const isSenderSameAsUser =
        user
            ? sender.name === `${user.lastName} ${user.firstName}` &&
            sender.phone === user.phoneNumber &&
            sender.detailAddress === user.detailAddress &&
            sender.wardCode === user.codeWard &&
            sender.cityCode === user.codeCity
            : false;

    useEffect(() => {
        if (status !== "draft") {
            setEditing(true);
            setUseUserView(false);
        }
        form.setFieldsValue(senderFormValues);
    }, [status, senderFormValues, form]); 


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

    const handleToggleUserInfo = () => {
        const newUseUserView = !useUserView;
        setUseUserView(newUseUserView);
        setEditing(!newUseUserView);

        const values = newUseUserView ? userFormValues : senderFormValues;
        form.setFieldsValue(values);

        if (onChange) {
            onChange({
                name: values.senderName,
                phone: values.senderPhone,
                detailAddress: values.sender.address,
                wardCode: values.sender.commune,
                cityCode: values.sender.province,
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

                    {status === "draft" && useUserView ? (
                        <>
                            <div
                                style={{
                                    padding: "0 16px",
                                    lineHeight: 1.6,
                                    marginTop: 16,
                                }}
                            >
                                <p>{userFormValues.senderName}</p>
                                <p>{userFormValues.senderPhone}</p>
                                <p>
                                    {userFormValues.sender.address},{" "}
                                    {wardList.find(
                                        (w) =>
                                            w.code ===
                                            userFormValues.sender.commune
                                    )?.name || ""}
                                    ,{" "}
                                    {provinceList.find(
                                        (p) =>
                                            p.code ===
                                            userFormValues.sender.province
                                    )?.name || ""}
                                </p>
                            </div>
                            <Button
                                style={styles.buttonEdit}
                                icon={<EditOutlined />}
                                onClick={handleToggleUserInfo}
                            >
                                Thay đổi địa chỉ cho đơn hàng
                            </Button>
                        </>
                    ) : (
                        <>
                            {status === "draft" &&
                                user &&
                                !useUserView && (
                                    <Button
                                        style={styles.buttonEdit}
                                        icon={<RollbackOutlined />}
                                        onClick={handleToggleUserInfo}
                                    >
                                        Khôi phục thông tin người gửi
                                    </Button>
                                )}
                            <Row gutter={16} style={{ marginTop: 30 }}>
                                <Col span={12}>
                                    <Form.Item
                                        name="senderName"
                                        label="Tên người gửi"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập tên người gửi",
                                            },
                                        ]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        name="senderPhone"
                                        label="Số điện thoại"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập số điện thoại",
                                            },
                                            {
                                                pattern: /^\d{10}$/,
                                                message:
                                                    "Số điện thoại phải đủ 10 số",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Ví dụ: 0901234567" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <AddressForm
                                        form={form}
                                        prefix="sender"
                                        disableCity={status !== "draft"}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                </Card>
            </Form>
        </div>
    );
};

export default SenderInfo;