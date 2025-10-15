import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Col, Form, message, Row } from "antd";
import { AppDispatch, RootState } from "../../../../store/store";
import { City, Ward } from "../../../../types/location";
import { getPayersEnum, getPaymentMethodsEnum, createOrderForManager, updateOrder } from "../../../../store/orderSlice";

import Header from "./components/Header";
import Actions from "./components/Actions";
import RecipientInfo from "./components/RecipientInfo";
import NoteCard from "./components/NoteCard";
import PaymentCard from "./components/PaymentCard";
import OrderInfo from "./components/OrderInfo";
import SenderInfo from "./components/SenderInfo";
import { serviceType } from "../../../../types/serviceType";
import { getActiveServiceTypes } from "../../../../store/serviceTypeSlice";
import { getByUserId, getOfficesByArea } from "../../../../store/officeSlice";
import { Office } from "../../../../types/office";
import { calculateShippingFee as calculateShippingFeeThunk } from "../../../../store/orderSlice";
import { useAppSelector } from "../../../../hooks/redux";
import { Order } from "../../../../types/order";
import { styles } from "../../../user/order/style/Order.styles";
import FeeCard from "./components/FeeCard";
import ToOffice from "./components/ToOffice";

const OrderCreateManager: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useAppSelector(state => state.auth);

    const [provinces, setCitys] = useState<City[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedServiceType, setSelectedServiceType] = useState<serviceType | null>(null);

    const [orderValue, setOrderValue] = useState(0);
    const [weight, setWeight] = useState(0);
    const [codAmount, setCodAmount] = useState(0);

    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const { shippingFee, loading: orderLoading, payers = [], paymentMethods = [] } =
        useSelector((state: RootState) => state.order);
    const [orderWeight, setOrderWeight] = useState(0);
    const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
    const [totalFee, setTotalFee] = useState(0);
    const [localOffices, setLocalOffices] = useState<Office[]>([]);

    // Form instances
    const [senderInfo] = Form.useForm();
    const [recipientInfo] = Form.useForm();
    const [paymentCard] = Form.useForm();
    const [toOffice] = Form.useForm();
    const [orderInfo] = Form.useForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Biến kiểm tra xem địa chỉ người nhận có tỉnh thành nằm trong khu vực hoạt động không
    const [isHasOfficeRecipient, setIsHasOfficerRecipient] = useState(true);

    const { office } = useAppSelector((state) => state.office);

    // State cho sender và recipient info
    const [senderData, setSenderData] = useState({
        name: "",
        phone: "",
        detailAddress: "",
        wardCode: 0,
        cityCode: 0,
    });

    const [recipientData, setRecipientData] = useState({
        name: "",
        phone: "",
        detailAddress: "",
        wardCode: 0,
        cityCode: 0,
    });

    const [paymentData, setPaymentData] = useState({
        payer: "Customer",
        paymentMethod: "Cash",
    });

    const [notes, setNotes] = useState("");

    // Lấy serviceType slice
    const { serviceTypes, loading: serviceLoading } =
        useSelector((state: RootState) => state.serviceType);

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

    useEffect(() => {
        console.log("office", selectedOffice);
    }, [selectedOffice]);

    const handleOrderInfoChange = (changedValues: any) => {
        if (changedValues.weight !== undefined) {
            setWeight(changedValues.weight);
            setOrderWeight(changedValues.weight);
        }

        if (changedValues.orderValue !== undefined) {
            setOrderValue(changedValues.orderValue);
        }

        if (changedValues.codAmount !== undefined) {
            setCodAmount(changedValues.codAmount);
        }

        if (changedValues.serviceType !== undefined) {
            const selected = serviceTypes?.find(s => s.id === changedValues.serviceType);
            setSelectedServiceType(selected || null);
            setServiceTypeId(selected?.id ?? null);
        }
    };

    // Hàm 1: Xử lý khi tạo đơn hàng thành công
    const handleOrderSuccess = async (
        order: Order,
        orderData: any
    ) => {
        // Hiển thị thông báo
        message.success("Tạo đơn hàng thành công!");

        // Kiểm tra ID
        if (!order.id) {
            message.error("Không tìm thấy ID đơn hàng");
            return;
        }

        // Điều hướng sang trang chi tiết
        if (user) {
            navigate(`/${user.role}/orders/detail/${order.trackingNumber}`, { replace: true });
        }
    };

    const handleCreateOrder = async () => {
        try {
            // Validate tất cả form
            await Promise.all([
                senderInfo.validateFields(),
                recipientInfo.validateFields(),
                paymentCard.validateFields(),
                toOffice.validateFields(),
                orderInfo.validateFields(),
            ]);

            setIsSubmitting(true);

            if (!isHasOfficeRecipient) {
                message.error(
                    "Rất tiếc, địa chỉ người nhận hiện nằm ngoài khu vực phục vụ của chúng tôi. Vui lòng chọn khu vực khác."
                );
                return;
            }

            // Chuẩn bị dữ liệu đơn hàng
            const orderData = {
                senderName: senderData.name,
                senderPhone: senderData.phone,
                senderCityCode: senderData.cityCode,
                senderWardCode: senderData.wardCode,
                senderDetailAddress: senderData.detailAddress,

                recipientName: recipientData.name,
                recipientPhone: recipientData.phone,
                recipientCityCode: recipientData.cityCode,
                recipientWardCode: recipientData.wardCode,
                recipientDetailAddress: recipientData.detailAddress,

                weight,
                serviceType: selectedServiceType,
                cod: codAmount || 0,
                orderValue: orderValue,
                payer: paymentData.payer,
                paymentStatus: paymentData.payer == "Shop" ? "Paid" : "Unpaid",
                notes: notes || "",
                shippingFee: shippingFee,
                toOffice: selectedOffice || undefined,
                status: "picked_up",
            } as Order;

            console.log("newOrder", orderData);

            const response = await dispatch(createOrderForManager(orderData)).unwrap();

            if (response.success && response.order) {
                handleOrderSuccess(response.order, orderData);
            } else {
                message.error(response.message || "Có lỗi xảy ra khi tạo đơn hàng");
            }
        } catch (error: any) {
            console.error("Create error:", error);
            if (error.errorFields) {
                message.error("Vui lòng điền đầy đủ các trường bắt buộc");
            } else if (error.message) {
                message.error(error.message);
            } else {
                message.error("Có lỗi xảy ra khi tạo đơn hàng");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!recipientData.cityCode || recipientData.cityCode === 0) return;

        setSelectedOffice(null);
        setLocalOffices([]);

        // Nếu có ward thì gửi luôn cả hai, backend tự fallback
        const params = {
            codeCity: recipientData.cityCode,
            ...(recipientData.wardCode && recipientData.wardCode !== 0 && { codeWard: recipientData.wardCode }),
        };

        dispatch(getOfficesByArea(params))
            .unwrap()
            .then((response) => {
                const fetchedOffices = response.offices || [];
                if (fetchedOffices.length === 0) {
                    setLocalOffices([]);
                    setIsHasOfficerRecipient(false);
                    message.error("Rất tiếc, chúng tôi chưa phục vụ khu vực này. Vui lòng chọn một thành phố khác");
                } else {
                    setIsHasOfficerRecipient(true);
                    setLocalOffices(fetchedOffices);
                }
            })
            .catch(() => {
                setLocalOffices([]);
                setIsHasOfficerRecipient(false);
            });
    }, [recipientData.cityCode, recipientData.wardCode, dispatch]);

    useEffect(() => {
        dispatch(getActiveServiceTypes());
        dispatch(getPayersEnum());
        dispatch(getPaymentMethodsEnum());
    }, [dispatch]);

    // Tính shipping fee khi có đủ thông tin
    useEffect(() => {
        if (office && recipientData.cityCode && orderWeight && serviceTypeId) {
            dispatch(calculateShippingFeeThunk({
                weight: orderWeight,
                serviceTypeId: serviceTypeId,
                senderCodeCity: office.codeCity,
                recipientCodeCity: recipientData.cityCode,
            }))
                .unwrap()
                .then((response) => {
                    const shippingFee = Math.floor(response.shippingFee);
                    setTotalFee(Math.max(0, shippingFee));
                })
                .catch((error) => {
                    console.error("Lỗi tính phí vận chuyển:", error);
                    setTotalFee(0);
                });
        } else {
            setTotalFee(0);
        }
    }, [recipientData.cityCode, orderWeight, serviceTypeId, dispatch]);

    // Load data
    useEffect(() => {
        if (user?.id) {
            dispatch(getByUserId(user.id));
        }
    }, [dispatch, user?.id]);

    return (
        <div style={styles.containerEdit}>
            <Row gutter={24} justify="center">
                {/* LEFT CONTENT */}
                <Col xs={24} lg={18} style={styles.leftContent}>
                    <div style={styles.scrollableContent}>
                        <div style={{
                            width: "100%",
                            maxWidth: 900,
                            position: 'relative'
                        }}>
                            {user && <Header role={user.role} />}

                            <SenderInfo
                                form={senderInfo}
                                sender={senderData}
                                cityList={provinces}
                                wardList={wards}
                                onChange={(newSender) => {
                                    setSenderData(newSender);
                                    if (newSender?.cityCode) {
                                        console.log("newSender city", newSender.cityCode);
                                    }
                                }}
                            />

                            <RecipientInfo
                                form={recipientInfo}
                                recipient={recipientData}
                                onChange={(values) => {
                                    setRecipientData({
                                        name: values.recipientName,
                                        phone: values.recipientPhone,
                                        detailAddress: values.recipient?.address || "",
                                        wardCode: values.recipient?.commune,
                                        cityCode: values.recipient?.province,
                                    });
                                }}
                            />

                            <PaymentCard
                                form={paymentCard}
                                payer={paymentData.payer}
                                payers={payers}
                                paymentMethod={paymentData.paymentMethod}
                                paymentMethods={paymentMethods}
                                onChangePayment={(changedValues) => {
                                    setPaymentData(prev => ({ ...prev, ...changedValues }));
                                }}
                            />

                            <OrderInfo
                                form={orderInfo}
                                weight={weight}
                                orderValue={orderValue}
                                cod={codAmount}
                                serviceTypes={serviceTypes}
                                serviceLoading={serviceLoading}
                                selectedServiceType={selectedServiceType}
                                setSelectedServiceType={(service) => {
                                    setSelectedServiceType(service);
                                    setServiceTypeId(service?.id ?? null);
                                }}
                                onChangeOrderInfo={handleOrderInfoChange}
                            />

                            <ToOffice
                                form={toOffice}
                                selectedOffice={selectedOffice}
                                offices={localOffices}
                                onChange={(office) => {
                                    setSelectedOffice(office);
                                }}
                            />

                            <NoteCard
                                notes={notes}
                                onChange={(newNotes) => {
                                    setNotes(newNotes);
                                }}
                            />
                        </div>
                    </div>
                </Col>

                {/* RIGHT SIDEBAR */}
                <Col xs={24} lg={6} style={styles.rightSidebar}>
                    <div>
                        <FeeCard
                            shippingFee={shippingFee}
                            totalFee={Math.ceil((shippingFee || 0) * 1.1) +
                                (codAmount ? codAmount * 0.02 : 0) +
                                (orderValue ? orderValue * 0.005 : 0) + 10000}
                            cod={codAmount}
                            orderValue={orderValue}
                        />
                    </div>
                    <Actions
                        onCreate={handleCreateOrder}
                        loading={isSubmitting}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default OrderCreateManager;