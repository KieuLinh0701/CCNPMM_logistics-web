import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button, Col, Form, InputNumber, message, Modal, Row, Tooltip } from "antd";
import { AppDispatch, RootState } from "../../../../store/store";
import { City, Ward } from "../../../../types/location";
import { getOrderByTrackingNumber, getOrderPayers, getOrderPaymentMethods, updateUserOrder } from "../../../../store/orderSlice";

import Header from "./components/Header";
import Actions from "./components/Actions";
import RecipientInfo from "./components/RecipientInfo";
import NoteCard from "./components/NoteCard";
import PaymentCard from "./components/PaymentCard";
import OrderInfo from "./components/OrderInfo";
import { styles } from "../style/Order.styles";
import SenderInfo from "./components/SenderInfo";
import { Order } from "../../../../types/order";
import SelectProductModal from "./components/SelectProductModal";
import { listActiveUserProducts } from "../../../../store/productSlice";
import { OrderProduct } from "../../../../types/orderProduct";
import { product } from "../../../../types/product";
import { serviceType } from "../../../../types/serviceType";
import { getActiveServiceTypes } from "../../../../store/serviceTypeSlice";
import { DeleteOutlined } from "@ant-design/icons";
import FromOffice from "./components/FromOffice";
import { getOfficesByArea } from "../../../../store/officeSlice";
import { Office } from "../../../../types/office";
import SelectedPromoModal from "./components/SelectPromoModal";
import { getActivePromotions } from "../../../../store/promotionSlice";
import { calculateShippingFee as calculateShippingFeeThunk } from "../../../../store/orderSlice";
import PromotionCard from "./components/PromotionCard";
import { Promotion, PromotionResponse } from "../../../../types/promotion";
import { useAppSelector } from "../../../../hooks/redux";

const OrderEdit: React.FC = () => {
    // Lấy trackingNumber trên url
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useAppSelector(state => state.auth);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const [provinces, setCitys] = useState<City[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [showProductModal, setShowProductModal] = useState<boolean>(false);

    // Lấy products sản phẩm đang Active của shop
    const { products, nextCursor } = useSelector((state: RootState) => state.product);

    // Quản lý searchText
    const [searchText, setSearchText] = useState("");

    // Các sản phẩm thuộc order đã chọn
    const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);

    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

    const [selectedServiceType, setSelectedServiceType] = useState<serviceType | null>(null);

    const [orderValue, setOrderValue] = useState(order?.orderValue || 0);
    const [weight, setWeight] = useState(order?.weight || 0);

    const { offices = [] } = useSelector((state: RootState) => state.office);

    const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [showPromoModal, setShowPromoModal] = useState<boolean>(false);
    const { promotions, nextCursor: promotionNextCursor } = useSelector((state: RootState) => state.promotion);
    const { shippingFee, loading: orderLoading, error: orderError, payers = [], paymentMethods = [] } =
        useSelector((state: RootState) => state.order);
    const [senderProvince, setSenderProvince] = useState(order?.senderCityCode || null);
    const [recipientProvince, setRecipientProvince] = useState(order?.recipientCityCode || null);
    const [orderWeight, setOrderWeight] = useState(order?.weight || 0);
    const [serviceTypeId, setServiceTypeId] = useState(order?.serviceType?.id || null);
    const [totalFee, setTotalFee] = useState(0);
    const [localOffices, setLocalOffices] = useState<Office[]>([]);
    const [tempStatus, setTempStatus] = useState<"draft" | "pending">("draft");

    const [senderInfo] = Form.useForm();
    const [recipientInfo] = Form.useForm();
    const [paymentCard] = Form.useForm();
    const [fromOffice] = Form.useForm();
    const [orderInfo] = Form.useForm();

    // Biến kiểm tra xem địa chỉ người gửi, người nhận có tỉnh thành nằm trong khu vực hoạt động không
    const [isHasOfficeSender, setIsHasOfficeSender] = useState(true);
    const [isHasOfficeRecipient, setIsHasOfficerRecipient] = useState(true);

    // Thêm state để quản lý số lượng
    const [quantityValues, setQuantityValues] = useState<{ [key: number]: number }>({});

    // Lấy serviceType slice
    const { serviceTypes, loading: serviceLoading, error: serviceError } =
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

    const handleOrderInfoChange = (changedValues: any) => {
        if (changedValues.weight !== undefined) {
            setWeight(changedValues.weight);
            setOrderWeight(changedValues.weight);
        }

        if (changedValues.orderValue !== undefined) {
            setOrderValue(changedValues.orderValue);
        }

        if (changedValues.codAmount !== undefined) {
            setOrder(prev => prev ? { ...prev, cod: changedValues.codAmount } : prev);
        }

        if (changedValues.serviceType !== undefined) {
            const selected = serviceTypes?.find(s => s.id === changedValues.serviceType);
            setSelectedServiceType(selected || null);
            setServiceTypeId(selected?.id ?? null);
        }
    };

    const handleSearchPromo = (value: string) => {
        setSearchText(value);
        dispatch(getActivePromotions({ limit: 10, searchText: value, shippingFee }));
    };

    const handleLoadMorePromotions = () => {
        if (promotionNextCursor) {
            dispatch(
                getActivePromotions({
                    limit: 10,
                    searchText,
                    lastId: promotionNextCursor,
                    shippingFee,
                })
            );
        }
    };

    const handleStatusChange = (newStatus: "draft" | "pending") => {
        setTempStatus(newStatus);
    };

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
                orderInfo.validateFields(),
            ]);

            if (order.status === "draft") {
                if (!isHasOfficeSender && !isHasOfficeRecipient) {
                    message.error(
                        "Rất tiếc, cả địa chỉ người gửi và người nhận đều nằm ngoài khu vực phục vụ. Vui lòng chọn khu vực khác."
                    );
                    return;
                }

                if (!isHasOfficeSender) {
                    message.error(
                        "Rất tiếc, địa chỉ người gửi hiện nằm ngoài khu vực phục vụ của chúng tôi. Vui lòng chọn khu vực khác."
                    );
                    return;
                }

                if (!isHasOfficeRecipient) {
                    message.error(
                        "Rất tiếc, địa chỉ người nhận hiện nằm ngoài khu vực phục vụ của chúng tôi. Vui lòng chọn khu vực khác."
                    );
                    return;
                }

                // Kiểm tra nếu có sản phẩm tươi sống => bắt buộc dùng dịch vụ hỏa tốc
                const hasFreshProduct = orderProducts.some(op => op.product.type === "Fresh");
                if (hasFreshProduct && serviceTypes) {
                    const fastService = serviceTypes.find(s => s.name.toLowerCase().includes("hỏa tốc"));
                    if (!selectedServiceType || selectedServiceType.id !== fastService?.id) {
                        message.warning("Đơn hàng có sản phẩm tươi sống. Vui lòng chọn dịch vụ HỎA TỐC!");
                        setSelectedServiceType(fastService || null);
                        setServiceTypeId(fastService?.id ?? null);
                        return;
                    }
                }
            }

            const updatedOrder = {
                ...order,
                orderProducts,
                orderValue,
                weight,
                serviceType: selectedServiceType ?? order.serviceType,
                fromOffice: selectedOffice as any,
                promotion: selectedPromo as any,
                status: tempStatus,
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
                        ...styles.button,
                        backgroundColor: "#1C3D90",
                        color: "#fff",
                    },
                },
                cancelButtonProps: {
                    style: {
                        ...styles.button,
                        backgroundColor: "#e0e0e0",
                        color: "#333",
                    },
                },
                onOk: async () => {
                    try {
                        // Gọi API 
                        const response = await dispatch(updateUserOrder(updatedOrder)).unwrap();

                        if (response.success) {
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

    const handleSelectProducts = (selected: product[]) => {
        const newOrderProducts: OrderProduct[] = selected.map((p) => {
            const existing = orderProducts.find(op => op.product.id === p.id);
            return {
                product: p,
                quantity: existing ? existing.quantity : 1,
                price: p.price,
            };
        });

        setOrderProducts(newOrderProducts);

        setSelectedProductIds(selected.map(s => s.id));

        const totalValue = newOrderProducts.reduce(
            (sum, op) => sum + op.product.price * op.quantity,
            0
        );
        const totalWeight = newOrderProducts.reduce(
            (sum, op) => sum + (op.product.weight || 0) * op.quantity,
            0
        );

        setOrderValue(totalValue);
        setWeight(totalWeight);
        setOrderWeight(totalWeight);
        setShowProductModal(false);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        dispatch(listActiveUserProducts({ limit: 10, searchText: value }));
    };

    const handleLoadMoreProducts = () => {
        if (nextCursor) {
            dispatch(
                listActiveUserProducts({
                    limit: 10,
                    lastId: nextCursor,
                    searchText,
                })
            );
        }
    };

    const handleQuantityChange = (value: number | null, index: number) => {
        if (value !== null && value > 0) {
            const updated = orderProducts.map((op, i) =>
                i === index ? { ...op, quantity: value } : op
            );

            setOrderProducts(updated);

            // Cập nhật tổng giá trị & khối lượng
            const totalValue = updated.reduce(
                (sum, op) => sum + op.product.price * op.quantity,
                0
            );
            const totalWeight = updated.reduce(
                (sum, op) => sum + (op.product.weight || 0) * op.quantity,
                0
            );
            setOrderValue(totalValue);
            setWeight(Number(totalWeight.toFixed(2)));
            setOrderWeight(Number(totalWeight.toFixed(2)));
        }
    };

    useEffect(() => {
        if (showProductModal) {
            setSelectedProductIds(orderProducts.map(op => op.product.id));
            // gọi fetch products nếu cần
            dispatch(listActiveUserProducts({ limit: 10, searchText: "" }));
        }
    }, [showProductModal]);

    useEffect(() => {
        dispatch(getActiveServiceTypes());
        dispatch(getOrderPayers());
        dispatch(getOrderPaymentMethods());
    }, [dispatch]);

    // Khi các giá trị này thay đổi thì tính shipping fee
    useEffect(() => {
        if (senderProvince && recipientProvince && orderWeight && serviceTypeId) {
            dispatch(calculateShippingFeeThunk({
                weight: orderWeight,
                serviceTypeId: serviceTypeId,
                senderCodeCity: senderProvince,
                recipientCodeCity: recipientProvince,
            }))
                .unwrap()
                .then((response) => {
                    const shippingFee = Math.floor(response.shippingFee);
                    setOrder(prev => prev ? { ...prev, shippingFee } : prev);
                    setTotalFee(Math.max(0, shippingFee - (order?.discountAmount || 0)));
                })
                .catch((error) => {
                    console.error("Lỗi tính phí vận chuyển:", error);
                    setOrder(prev => prev ? { ...prev, shippingFee: 0 } : prev);
                    setTotalFee(0);
                });
        } else {
            console.log("Thiếu thông tin để tính phí vận chuyển");
            setOrder(prev => prev ? { ...prev, shippingFee: 0 } : prev);
            setTotalFee(0);
        }
    }, [senderProvince, recipientProvince, orderWeight, serviceTypeId, dispatch]);

    // Khi senderProvince thay đổi thì lấy office
    useEffect(() => {
        if (senderProvince && senderWard) {
            setSelectedOffice(null);
            setLocalOffices([]);

            dispatch(getOfficesByArea({ codeCity: senderProvince, codeWard: senderWard.code }))
                .unwrap()
                .then((response) => {
                    const fetchedOffices = response.offices || [];

                    setLocalOffices(fetchedOffices);

                    if (fetchedOffices.length === 0) {
                        setSelectedOffice(null);
                        setIsHasOfficeSender(false);
                        message.error(
                            "Rất tiếc, chúng tôi chưa phục vụ khu vực này. Vui lòng chọn một thành phố khác"
                        );
                    } else {
                        setIsHasOfficeSender(true);
                        if (order?.fromOffice) {
                            const matchedOffice = fetchedOffices.find(
                                office => office.id === order.fromOffice?.id && office.codeCity === senderProvince
                            );
                            setSelectedOffice(matchedOffice || null);
                        } else {
                            setSelectedOffice(null);
                        }
                    }
                })
                .catch((error) => {
                    setLocalOffices([]);
                    setSelectedOffice(null);
                });
        } else {
            setLocalOffices([]);
            setSelectedOffice(null);
        }
    }, [senderProvince, dispatch, order?.fromOffice]);

    // Theo dõi khi recipient.cityCode thay đổi
    useEffect(() => {
        if (recipientProvince && recipientProvince !== 0) {
            dispatch(getOfficesByArea({ codeCity: recipientProvince }))
                .unwrap()
                .then((response) => {
                    const fetchedOffices = response.offices || [];
                    if (fetchedOffices.length == 0) {
                        setIsHasOfficerRecipient(false);
                        message.error("Rất tiếc, chúng tôi chưa phục vụ khu vực này. Vui lòng chọn một thành phố khác")
                    } else {
                        setIsHasOfficerRecipient(true);
                    }
                })
                .catch((error) => {
                    setLocalOffices([]);
                    setIsHasOfficerRecipient(false);
                });
        }
    }, [recipientProvince]);

    useEffect(() => {
        setSearchText("");
        dispatch(getActivePromotions({ limit: 10, searchText: "", shippingFee: shippingFee }));
    }, [dispatch, shippingFee]);

    useEffect(() => {
        if (order?.promotion) {
            setSelectedPromo(order.promotion);
        }
    }, [order?.promotion]);

    useEffect(() => {
        if (!selectedPromo) {
            setTotalFee(order?.shippingFee || 0);
            return;
        }

        let discount = 0;

        if (selectedPromo.discountType === 'fixed') {
            discount = selectedPromo.discountValue;
        } else if (selectedPromo.discountType === 'percentage') {
            discount = ((order?.shippingFee || 0) * selectedPromo.discountValue) / 100;
        }

        // Không vượt quá maxDiscountAmount
        if (selectedPromo.maxDiscountAmount) {
            discount = Math.min(discount, selectedPromo.maxDiscountAmount);
        }

        discount = Math.floor(discount);

        // Nếu phí ship không đủ để áp promo thì bỏ promo
        if ((order?.shippingFee || 0) < selectedPromo.minOrderValue) {
            setSelectedPromo(null);
            setTotalFee(order?.shippingFee || 0);
            return;
        }

        setTotalFee((order?.shippingFee || 0) - discount);
    }, [order?.shippingFee, selectedPromo]);

    useEffect(() => {
        if (shippingFee > 0) {
            dispatch(getActivePromotions({ limit: 10, searchText: "", shippingFee }))
                .unwrap()
                .then((res: PromotionResponse) => {
                    const promos = res.promotions || [];
                    // Nếu selectedPromo không còn trong danh sách mới thì reset
                    if (
                        selectedPromo &&
                        !promos.some((p) => p.code === selectedPromo.code)
                    ) {
                        setSelectedPromo(null);
                    }
                })
                .catch((err) => {
                    console.error("Lỗi load promotions:", err);
                });
        }
    }, [shippingFee, dispatch, selectedPromo]);

    useEffect(() => {
        if (!selectedPromo) {
            setOrder((prev) => prev ? { ...prev, discountAmount: 0 } : prev);
            setTotalFee(order?.shippingFee || 0);
            return;
        }

        const shipping = order?.shippingFee || 0;
        let discount = 0;

        if (selectedPromo.discountType === "fixed") {
            discount = selectedPromo.discountValue;
        } else if (selectedPromo.discountType === "percentage") {
            discount = (shipping * selectedPromo.discountValue) / 100;
        }

        if (selectedPromo.maxDiscountAmount) {
            discount = Math.min(discount, selectedPromo.maxDiscountAmount);
        }

        // Nếu phí ship không đủ điều kiện promo thì bỏ promo
        if (shipping < (selectedPromo.minOrderValue || 0)) {
            setSelectedPromo(null);
            setOrder((prev) => prev ? { ...prev, discountAmount: 0 } : prev);
            setTotalFee(shipping);
            return;
        }

        // Cập nhật order và tổng phí
        setOrder((prev) => prev ? { ...prev, discountAmount: discount } : prev);
        setTotalFee(Math.max(0, Math.floor(shipping - discount)));
    }, [selectedPromo, order?.shippingFee]);

    useEffect(() => {
        const initializeOrder = async () => {
            if (!trackingNumber) return;
            try {
                const resp = await dispatch(getOrderByTrackingNumber(trackingNumber)).unwrap();
                const orderData = resp.order;

                if (orderData) {
                    setOrder(orderData);

                    setOrderProducts(orderData.orderProducts ?? []);
                    setOrderValue(orderData.orderValue || 0);
                    setWeight(orderData.weight || 0);
                    setOrderWeight(orderData.weight || 0);

                    if (orderData.senderCityCode) {
                        const senderCity = Number(orderData.senderCityCode);
                        setSenderProvince(senderCity);

                        dispatch(getOfficesByArea({ codeCity: senderCity }))
                            .unwrap()
                            .then((response) => {
                                const fetchedOffices = response.offices || [];
                                setLocalOffices(fetchedOffices);

                                if (orderData.fromOffice && fetchedOffices.length > 0) {
                                    setSelectedOffice(orderData.fromOffice);
                                }
                            });
                    }

                    if (orderData.recipientCityCode) {
                        setRecipientProvince(Number(orderData.recipientCityCode));
                    }
                    if (orderData.serviceType) {
                        setServiceTypeId(Number(orderData.serviceType.id));
                        setSelectedServiceType(orderData.serviceType);
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        initializeOrder();
    }, [dispatch, trackingNumber]);

    useEffect(() => {
        const currentProductIds = orderProducts.map(op => op.product.id);
        setSelectedProductIds(currentProductIds);
    }, [orderProducts]);

    if (loading || !order) {
        return <div>Đang tải chi tiết đơn hàng...</div>;
    }

    const senderWard = wards.find((w) => w.code === Number(order.senderWardCode));
    const recipientWard = wards.find((w) => w.code === Number(order.recipientWardCode));

    const canEditSender = ["draft", "pending"].includes(order.status);
    const canEditRecipient = ["draft", "pending", "confirmed"].includes(order.status);
    const canEditPayStatus = ["draft", "pending"].includes(order.status);
    const canEditPay =
        canEditPayStatus &&
        (
            (order.paymentMethod as 'Cash' | 'BankTransfer' | 'VNPay' | 'ZaloPay') === "Cash" ||
            (order.paymentMethod !== "Cash" && order.paymentStatus === "Unpaid")
        );
    const canEditCod = ["draft", "pending"].includes(order.status);
    const canEditNote = ["draft", "pending", "confirmed"].includes(order.status);
    const canEditFromOffice = ["draft"].includes(order.status);
    const canEditPromotion = ["draft"].includes(order.status);

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
                                    user={
                                        order.status === "draft" && order.user
                                            ? {
                                                firstName: order.user.firstName,
                                                lastName: order.user.lastName,
                                                phoneNumber: order.user.phoneNumber,
                                                detailAddress: order.user.detailAddress || "",
                                                codeWard: order.user.codeWard || 0,
                                                codeCity: order.user.codeCity || 0,
                                            }
                                            : undefined
                                    }
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
                                        if (newSender?.cityCode) {
                                            const city = Number(newSender.cityCode);
                                            console.log("📍 Sender city changed to:", city);
                                            setSenderProvince(city);
                                            setSelectedOffice(null);
                                        }
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
                                        if (values.recipient?.province) {
                                            setRecipientProvince(values.recipient.province);
                                        }
                                    }}
                                />
                            )}

                            {canEditPay && (
                                <PaymentCard
                                    form={paymentCard}
                                    payer={order.payer}
                                    payers={payers}
                                    paymentMethod={order.paymentMethod}
                                    paymentMethods={paymentMethods}
                                    onChangePayment={(changedValues) => {
                                        setOrder((prev) => prev ? { ...prev, ...changedValues } : prev);
                                    }}
                                />
                            )}

                            {canEditCod && (
                                <OrderInfo
                                    form={orderInfo}
                                    weight={weight}
                                    orderValue={orderValue}
                                    cod={order.cod}
                                    status={order.status}
                                    orderProducts={orderProducts}
                                    orderColumns={[
                                        {
                                            title: "Tên sản phẩm",
                                            dataIndex: ["product", "name"],
                                            key: "name",
                                            align: "center",
                                        },
                                        {
                                            title: "Trọng lượng (Kg)",
                                            dataIndex: ["product", "weight"],
                                            key: "weight",
                                            align: "center",
                                        },
                                        {
                                            title: "Giá (VNĐ)",
                                            dataIndex: ["product", "price"],
                                            key: "price",
                                            align: "center",
                                            render: (price: number) => `${price.toLocaleString()}₫`,
                                        },
                                        {
                                            title: "Số lượng",
                                            dataIndex: "quantity",
                                            key: "quantity",
                                            align: "center",
                                            render: (value: number, record: OrderProduct, index: number) => {
                                                const currentValue = quantityValues[index] || value;

                                                const handleChange = (newValue: number | null) => {
                                                    const numValue = newValue || 0;

                                                    // Validate stock
                                                    if (numValue > record.product.stock) {
                                                        message.error(`Số lượng vượt quá tồn kho! Tồn kho hiện tại: ${record.product.stock}`);
                                                        return;
                                                    }

                                                    handleQuantityChange(numValue, index);
                                                };

                                                return (
                                                    <Form.Item
                                                        name={['orderProducts', index, 'quantity']}
                                                        rules={[
                                                            {
                                                                validator: (_, val) => {
                                                                    if (val === undefined || val === null || val === '') {
                                                                        return Promise.reject(new Error("Vui lòng nhập số lượng"));
                                                                    }

                                                                    const numValue = Number(val);
                                                                    if (isNaN(numValue)) {
                                                                        return Promise.reject(new Error("Số lượng phải là số"));
                                                                    }

                                                                    if (numValue <= 0) {
                                                                        return Promise.reject(new Error("Số lượng phải lớn hơn 0"));
                                                                    }

                                                                    if (numValue > record.product.stock) {
                                                                        return Promise.reject(
                                                                            new Error(`Số lượng tối đa hiện tại: ${record.product.stock}`)
                                                                        );
                                                                    }

                                                                    return Promise.resolve();
                                                                },
                                                            },
                                                        ]}
                                                        initialValue={currentValue}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                    >
                                                        <InputNumber
                                                            min={1}
                                                            max={record.product.stock}
                                                            value={currentValue}
                                                            onChange={handleChange}
                                                            onBlur={(e) => {
                                                                const value = e.target.value;
                                                                if (value && Number(value) > record.product.stock) {
                                                                    message.warning(`Số lượng không được vượt quá ${record.product.stock}`);
                                                                }
                                                            }}
                                                            style={{
                                                                width: 100,
                                                                borderColor: currentValue > record.product.stock ? '#ff4d4f' : undefined
                                                            }}
                                                            placeholder="Nhập số lượng"
                                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                                                        />
                                                    </Form.Item>
                                                );
                                            },
                                        },
                                        {
                                            title: "Tồn kho",
                                            dataIndex: ["product", "stock"],
                                            key: "stock",
                                            align: "center",
                                            render: (stock: number, record: OrderProduct) => (
                                                <div>
                                                    <span style={{
                                                        color: stock === 0 ? '#ff4d4f' :
                                                            stock < 10 ? '#faad14' : '#52c41a',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {stock.toLocaleString()}
                                                    </span>
                                                </div>
                                            ),
                                        },
                                        ...(order.status === "draft"
                                            ? [
                                                {
                                                    title: "Hành động",
                                                    key: "action",
                                                    align: "center",
                                                    render: (_: any, record: OrderProduct) => (
                                                        <Tooltip title="Xoá sản phẩm">
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => {
                                                                    setOrderProducts((prev) => {
                                                                        const updated = prev.filter(
                                                                            (op) => op.product.id !== record.product.id
                                                                        );

                                                                        setSelectedProductIds((prevIds) =>
                                                                            prevIds.filter(id => id !== record.product.id)
                                                                        );

                                                                        const totalValue = updated.reduce(
                                                                            (sum, op) => sum + op.product.price * op.quantity,
                                                                            0
                                                                        );
                                                                        const totalWeight = updated.reduce(
                                                                            (sum, op) => sum + (op.product.weight || 0) * op.quantity,
                                                                            0
                                                                        );
                                                                        setOrderValue(totalValue);
                                                                        setWeight(totalWeight);
                                                                        setOrderWeight(totalWeight);
                                                                        return updated;
                                                                    });
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    ),
                                                },
                                            ]
                                            : []),
                                    ]}
                                    serviceTypes={serviceTypes}
                                    serviceLoading={serviceLoading}
                                    selectedServiceType={selectedServiceType || order.serviceType}
                                    setSelectedServiceType={(service) => {
                                        setSelectedServiceType(service);
                                        setServiceTypeId(service?.id ?? null);
                                    }}
                                    onOpenProductModal={() => setShowProductModal(true)}
                                    onChangeOrderInfo={handleOrderInfoChange}
                                />
                            )}

                            {canEditFromOffice && (
                                <FromOffice
                                    form={fromOffice}
                                    status={order.status}
                                    selectedOffice={selectedOffice}
                                    offices={localOffices}
                                    onChange={setSelectedOffice}
                                    wards={wards}
                                    cities={provinces}
                                />
                            )}

                            {canEditNote &&
                                <NoteCard
                                    notes={order.notes}
                                    onChangeNotes={(value) => setOrder({ ...order, notes: value })}
                                />}

                            {/* Nếu không có promotion, Actions nằm dưới form */}
                            {!canEditPromotion && (
                                <div style={{ marginTop: 24, width: "100%" }}>
                                    <Actions
                                        onEdit={handleEdit}
                                        onCancel={handleCancelOrder}
                                        onStatusChange={handleStatusChange}
                                        status={order.status}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </Col>

                {/* RIGHT SIDEBAR */}
                {canEditPromotion && (
                    <Col xs={24} lg={6} style={styles.rightSidebar}>
                        <div>
                            <PromotionCard
                                shippingFee={order.shippingFee}
                                discountAmount={order.discountAmount}
                                totalFee={Math.ceil(
                                    Math.max(((order.shippingFee || 0) - (order.discountAmount || 0)), 0) * 1.1 +
                                    (orderValue ? orderValue * 0.005 : 0) +
                                    (order.cod ? order.cod * 0.02 : 0)
                                )}
                                cod={order.cod}
                                orderValue={order.orderValue}
                                selectedPromo={selectedPromo}
                                setSelectedPromo={setSelectedPromo}
                                setShowPromoModal={setShowPromoModal}
                            />

                            {/* Modal */}
                            <SelectProductModal
                                open={showProductModal}
                                products={products}
                                nextCursor={nextCursor ?? null}
                                selectedProductIds={selectedProductIds}
                                setSelectedProductIds={setSelectedProductIds}
                                loading={loading}
                                onClose={() => setShowProductModal(false)}
                                onSearch={handleSearch}
                                onSelectProducts={handleSelectProducts}
                                onLoadMore={handleLoadMoreProducts}
                                initialSelectedProducts={
                                    order?.orderProducts?.map((op) => op.product) ?? []
                                }
                            />

                            <SelectedPromoModal
                                open={showPromoModal}
                                onCancel={() => setShowPromoModal(false)}
                                promotions={promotions}
                                selectedPromo={selectedPromo}
                                setSelectedPromo={setSelectedPromo}
                                onSearch={handleSearchPromo}
                                onLoadMore={handleLoadMorePromotions}
                                nextCursor={promotionNextCursor ?? null}
                            />
                        </div>

                        {/* Actions luôn ở dưới cùng sidebar */}
                        <Actions
                            onEdit={handleEdit}
                            onCancel={handleCancelOrder}
                            onStatusChange={handleStatusChange}
                            status={order.status}
                        />
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default OrderEdit;