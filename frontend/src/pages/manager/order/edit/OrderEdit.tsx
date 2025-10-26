import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Col, Form, message, Modal, Row } from "antd";

import Header from "./components/Header";
import Actions from "./components/Actions";
import RecipientInfo from "./components/RecipientInfo";
import NoteCard from "./components/NoteCard";
import SenderInfo from "./components/SenderInfo";
import OfficeCard from "./components/OfficeCard";
import { AppDispatch, RootState } from "../../../../store/store";
import { useAppSelector } from "../../../../hooks/redux";
import { Order } from "../../../../types/order";
import { City, Ward } from "../../../../types/location";
import { Office } from "../../../../types/office";
import { styles } from "../../../user/order/style/Order.styles";
import { getOrderByTrackingNumber, getOrderPayers, getOrderPaymentMethods, updateManagerOrder } from "../../../../store/orderSlice";
import { getOfficesByArea } from "../../../../store/officeSlice";

const OrderEditManager: React.FC = () => {
    // Lấy trackingNumber trên url
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useAppSelector(state => state.auth);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const [provinces, setCitys] = useState<City[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedFromOffice, setSelectedFromOffice] = useState<Office | null>(null);
    const [selectedToOffice, setSelectedToOffice] = useState<Office | null>(null);
    const [fromOffices, setFromOffices] = useState<Office[]>([]);
    const [toOffices, setToOffices] = useState<Office[]>([]);


    const { payers = [], paymentMethods = [] } = useSelector((state: RootState) => state.order);
    const [senderProvince, setSenderProvince] = useState(order?.senderCityCode || null);
    const [recipientProvince, setRecipientProvince] = useState(order?.recipientCityCode || null);
    const [localOffices, setLocalOffices] = useState<Office[]>([]);

    const [senderInfo] = Form.useForm();
    const [recipientInfo] = Form.useForm();
    const [paymentCard] = Form.useForm();
    const [fromOffice] = Form.useForm();

    // Biến kiểm tra xem địa chỉ người gửi, người nhận có tỉnh thành nằm trong khu vực hoạt động không
    const [isHasOfficeSender, setIsHasOfficeSender] = useState(true);
    const [isHasOfficeRecipient, setIsHasOfficeRecipient] = useState(true);

    const canEditFlags = React.useMemo(() => {
        if (!order) return { canEditFromOffice: false, canEditToOffice: false };
        return {
            canEditFromOffice: ["confirmed"].includes(order.status),
            canEditToOffice: ["confirmed", "picked_up"].includes(order.status),
        };
    }, [order]);

    // --- Fetch tất cả provinces + wards ---
    useEffect(() => {
        axios
            .get<City[]>("https://provinces.open-api.vn/api/v2/p/")
            .then((res) => setCitys(res.data))
            .catch((err) => console.error("Lỗi load provinces:", err));

        axios
            .get<Ward[]>("https://provinces.open-api.vn/api/v2/w/")
            .then((res) => setWards(res.data))
            .catch((err) => console.error("Lỗi load wards:", err));
    }, []);

    const handleEditSuccess = () => {
        if (!order) return;

        if (user) {
            navigate(`/${user.role}/orders/detail/${order.trackingNumber}`, { replace: true });
        }
    };

    // Lưu các thay đổi (bao gồm status đã được thay đổi trước đó)
    const handleEdit = async () => {
        if (!order) return;

        try {
            await Promise.all([
                senderInfo.validateFields(),
                recipientInfo.validateFields(),
                paymentCard.validateFields(),
                fromOffice.validateFields(),
            ]);

            const updatedOrder = {
                ...order,
                fromOffice: selectedFromOffice ?? order.fromOffice,
                toOffice: selectedToOffice ?? order.toOffice,
            };

            // Hiển thị modal xác nhận trước khi lưu
            Modal.confirm({
                title: "Xác nhận lưu thay đổi",
                content: (
                    <div>
                        <p>Bạn có chắc chắn muốn lưu các thay đổi này?</p>
                    </div>
                ),
                okText: "Lưu",
                cancelText: "Hủy",
                centered: true,
                icon: null,
                okButtonProps: {
                    style: {
                        backgroundColor: "#1C3D90",
                        color: "#fff",
                    },
                },
                cancelButtonProps: {
                    style: {
                        backgroundColor: "#ffffff",
                        borderColor: "#1C3D90",
                        color: "#1C3D90",
                    },
                },
                onOk: async () => {
                    try {
                        // Gọi API 
                        const response = await dispatch(updateManagerOrder(updatedOrder)).unwrap();

                        if (response.success) {
                            message.success(response.message || "Cập nhật đơn hàng thành công");
                            handleEditSuccess();
                        } else {
                            message.error(response.message || "Có lỗi xảy ra khi lưu thông tin");
                        }
                    } catch (error: any) {
                        console.error("Edit error:", error);
                        if (error.message) {
                            message.error(error.message);
                        } else {
                            message.error("Có lỗi xảy ra khi lưu thông tin");
                        }
                    }
                },
                onCancel: () => {
                    console.log("User cancelled save operation");
                }
            });

        } catch (error: any) {
            console.error("Edit error:", error);

            if (error.message) {
                message.error(error.message);
            } else {
                message.error("Vui lòng điền đầy đủ các trường bắt buộc");
            }
        }
    };

    const handleCancelOrder = () => {
        Modal.confirm({
            title: "Xác nhận hủy",
            content: "Bạn chắc chắn muốn bỏ chỉnh sửa?",
            okText: "Hủy",
            cancelText: "Không",
            centered: true,
            icon: null,
            okButtonProps: {
                style: {
                    backgroundColor: "#1C3D90",
                    color: "#fff",
                },
            },
            cancelButtonProps: {
                style: {
                    backgroundColor: "#ffffff",
                    borderColor: "#1C3D90",
                    color: "#1C3D90",
                },
            },
            onOk: async () => {
                navigate(-1);
            },
        });
    };

    useEffect(() => {
        dispatch(getOrderPayers());
        dispatch(getOrderPaymentMethods());
        console.log("payers", payers);
    }, [dispatch]);

    useEffect(() => {
        if (!order || order.createdByType !== "user") return;

        dispatch(
            getOfficesByArea({
                codeCity: order.senderCityCode,
                codeWard: order.senderWardCode,
            })
        )
            .unwrap()
            .then((res) => {
                const fetched = res.offices || [];
                setFromOffices(fetched);

                if (fetched.length === 0) {
                    setSelectedFromOffice(null);
                    setIsHasOfficeSender(false);
                    message.error(
                        "Rất tiếc, chúng tôi chưa phục vụ khu vực gửi này. Vui lòng chọn một thành phố khác"
                    );
                    return;
                }

                // Giữ lại nếu bưu cục cũ còn trong danh sách mới
                if (selectedFromOffice) {
                    const stillExists = fetched.find(
                        (o) => o.id === selectedFromOffice.id
                    );
                    setSelectedFromOffice(stillExists || null);
                } else {
                    setSelectedFromOffice(null);
                }
            })
            .catch(() => {
                setFromOffices([]);
                setSelectedFromOffice(null);
            });
    }, [order?.senderCityCode, order?.senderWardCode, dispatch]);

    // Lấy danh sách bưu cục gửi
    useEffect(() => {
        if (!order) return;

        dispatch(
            getOfficesByArea({
                codeCity: order.recipientCityCode,
                codeWard: order.recipientWardCode,
            })
        )
            .unwrap()
            .then((res) => {
                const fetched = res.offices || [];
                setToOffices(fetched);

                if (fetched.length === 0) {
                    setSelectedToOffice(null);
                    setIsHasOfficeRecipient(false);
                    message.error(
                        "Rất tiếc, chúng tôi chưa phục vụ khu vực này. Vui lòng chọn một thành phố khác"
                    );
                    return;
                }

                // 🔍 Kiểm tra xem bưu cục đang chọn có còn trong danh sách mới không
                if (selectedToOffice) {
                    const stillExists = fetched.find(
                        (o) => o.id === selectedToOffice.id
                    );
                    setSelectedToOffice(stillExists || null);
                } else {
                    setSelectedToOffice(null);
                }
            })
            .catch(() => {
                setToOffices([]);
                setSelectedToOffice(null);
            });
    }, [order?.recipientCityCode, order?.recipientWardCode, dispatch]);

    useEffect(() => {
        const initializeOrder = async () => {
            if (!trackingNumber) return;
            try {
                const resp = await dispatch(getOrderByTrackingNumber(trackingNumber)).unwrap();
                const orderData = resp.order;

                if (orderData) {
                    setOrder(orderData);

                    let city = null;
                    let ward = null;
                    if (canEditFlags.canEditFromOffice) {
                        city = Number(orderData.senderCityCode);
                        ward = Number(orderData.senderWardCode)
                    } else {
                        city = Number(orderData.recipientCityCode);
                        ward = Number(orderData.recipientWardCode)
                    }

                    setRecipientProvince(Number(orderData.recipientCityCode));
                    setSenderProvince(Number(orderData.senderCityCode));

                    dispatch(getOfficesByArea({ codeCity: city, codeWard: ward }))
                        .unwrap()
                        .then((response) => {
                            const fetchedOffices = response.offices || [];
                            setLocalOffices(fetchedOffices);

                            if (orderData.fromOffice && fetchedOffices.length > 0) {
                                setSelectedFromOffice(orderData.fromOffice);
                            }
                            if (orderData.toOffice && fetchedOffices.length > 0) {
                                setSelectedToOffice(orderData.toOffice);
                            }
                        });
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        initializeOrder();
    }, [dispatch, trackingNumber]);

    if (loading || !order) {
        return <div>Đang tải chi tiết đơn hàng...</div>;
    }

    const senderWard = wards.find((w) => w.code === Number(order.senderWardCode));
    const recipientWard = wards.find((w) => w.code === Number(order.recipientWardCode));

    const canEditSender = ["confirmed"].includes(order.status);
    const canEditRecipient = ["confirmed", "picked_up", "in_transit"].includes(order.status);
    const canEditNote = ["confirmed", "picked_up", "in_transit"].includes(order.status);
    const canEditOffice = ["confirmed", "picked_up"].includes(order.status);

    return (
        <div style={styles.containerEdit}>
            <Row gutter={24} justify="center">
                {/* LEFT CONTENT */}
                <Col xs={24} lg={18} style={styles.leftContent}>
                    <div style={styles.scrollableContent}>
                        <div style={{ width: "100%", maxWidth: 900 }}>
                            {user &&
                                <Header trackingNumber={order.trackingNumber!} role={user.role} />
                            }

                            {canEditSender && (
                                <SenderInfo
                                    form={senderInfo}
                                    status={order.status}
                                    sender={{
                                        name: order.senderName,
                                        phone: order.senderPhone,
                                        detailAddress: order.senderDetailAddress,
                                        wardCode: order.senderWardCode,
                                        cityCode: order.senderCityCode,
                                        wardList: senderWard ? [senderWard] : [],
                                    }}
                                    provinceList={provinces}
                                    wardList={wards}
                                    onChange={(newSender) => {
                                        setOrder((prev) => ({
                                            ...prev!,
                                            senderName: newSender.name,
                                            senderPhone: newSender.phone,
                                            senderDetailAddress: newSender.detailAddress,
                                            senderWardCode: newSender.wardCode,
                                            senderCityCode: newSender.cityCode,
                                        }));
                                    }}
                                />
                            )}

                            {canEditRecipient && (
                                <RecipientInfo
                                    form={recipientInfo}
                                    status={order.status}
                                    recipient={{
                                        name: order.recipientName,
                                        phone: order.recipientPhone,
                                        detailAddress: order.recipientDetailAddress,
                                        wardCode: order.recipientWardCode,
                                        cityCode: order.recipientCityCode,
                                        wardList: recipientWard ? [recipientWard] : [],
                                    }}
                                    onChange={(values) => {
                                        setOrder((prev) => {
                                            if (!prev) return prev;

                                            return {
                                                ...prev,
                                                recipientName: values.recipientName,
                                                recipientPhone: values.recipientPhone,
                                                recipientDetailAddress: values.recipient?.address,
                                                recipientWardCode: values.recipient?.commune,
                                                recipientCityCode: values.recipient?.province,
                                            };
                                        });
                                    }}
                                />
                            )}

                            {["confirmed"].includes(order.status) && order.createdByType === "user" &&
                                <OfficeCard
                                    form={fromOffice}
                                    status={order.status}
                                    title="Bưu cục gửi"
                                    selectedOffice={selectedFromOffice}
                                    offices={fromOffices}
                                    onChange={setSelectedFromOffice}
                                    wards={wards}
                                    cities={provinces}
                                />
                            }

                            {["confirmed", "picked_up"].includes(order.status) &&
                                <OfficeCard
                                    form={fromOffice}
                                    status={order.status}
                                    title="Bưu cục nhận"
                                    selectedOffice={selectedToOffice}
                                    offices={toOffices}
                                    onChange={setSelectedToOffice}
                                    wards={wards}
                                    cities={provinces}
                                />
                            }

                            {canEditNote &&
                                <NoteCard
                                    notes={order.notes}
                                    onChangeNotes={(value) => setOrder({ ...order, notes: value })}
                                />}

                            <div style={{ marginTop: 24, width: "100%" }}>
                                <Actions
                                    onEdit={handleEdit}
                                    onCancel={handleCancelOrder}
                                    status={order.status}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div >
    );
};

export default OrderEditManager;