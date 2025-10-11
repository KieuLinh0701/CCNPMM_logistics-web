import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Button, Col, Form, InputNumber, message, Modal, Row, Tooltip } from "antd";
import { AppDispatch, RootState } from "../../../../store/store";
import { City, Ward } from "../../../../types/location";
import { getOrderById, updateOrder } from "../../../../store/orderSlice";

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
import { getActiveProductsByUser } from "../../../../store/productSlice";
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
    // Lấy id trên url
    const { id } = useParams<{ id: string }>();
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
    const { shippingFee, loading: orderLoading, error: orderError } =
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

    // Lấy serviceType slice
    const { serviceTypes, loading: serviceLoading, error: serviceError } =
        useSelector((state: RootState) => state.serviceType);

    // --- Fetch tất cả provinces + wards ---
    useEffect(() => {
        axios
            .get<City[]>("https://provinces.open-api.vn/api/p/")
            .then((res) => setCitys(res.data))
            .catch((err) => console.error("Lỗi load provinces:", err));

        axios
            .get<Ward[]>("https://provinces.open-api.vn/api/w/")
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
                    shippingFee, // dùng giá trị từ redux
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
            navigate(`/${user.role}/orders/detail/${order.id}`, { replace: true });
        }
    };

    // Lưu các thay đổi (bao gồm status đã được thay đổi trước đó)
    const handleEdit = async () => {
        if (!order) return;

        try {
            await senderInfo.validateFields();
            await recipientInfo.validateFields();
            await paymentCard.validateFields();
            await fromOffice.validateFields();
            await orderInfo.validateFields();

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

            console.log("Saving order with current status:", updatedOrder.status);
            console.log("newOrder: ", updatedOrder);

            // Hiển thị modal xác nhận trước khi lưu
            Modal.confirm({
                title: "Xác nhận lưu thay đổi",
                content: (
                    <div>
                        <p>Bạn có chắc chắn muốn lưu các thay đổi này?</p>
                    </div>
                ),
                okText: "Lưu thay đổi",
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
                        const response = await dispatch(updateOrder(updatedOrder)).unwrap();

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
        dispatch(getActiveProductsByUser({ limit: 10, searchText: value }));
    };

    const handleLoadMoreProducts = () => {
        if (nextCursor) {
            dispatch(
                getActiveProductsByUser({
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
            setWeight(Number(totalWeight.toFixed(3)));
            setOrderWeight(Number(totalWeight.toFixed(3)));
        }
    };

    useEffect(() => {
        if (showProductModal) {
            setSelectedProductIds(orderProducts.map(op => op.product.id));
            // gọi fetch products nếu cần
            dispatch(getActiveProductsByUser({ limit: 10, searchText: "" }));
        }
    }, [showProductModal]);

    useEffect(() => {
        dispatch(getActiveServiceTypes());
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
        if (senderProvince) {
            setSelectedOffice(null);
            setLocalOffices([]);

            dispatch(getOfficesByArea({ codeCity: senderProvince }))
                .unwrap()
                .then((response) => {
                    const fetchedOffices = response.offices || [];

                    setLocalOffices(fetchedOffices);

                    if (fetchedOffices.length === 0) {
                        setSelectedOffice(null);
                    } else {
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
            if (!id) return;
            try {
                const resp = await dispatch(getOrderById(Number(id))).unwrap();
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
    }, [dispatch, id]);

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
                                                detailAddress: order.user.detailAddress,
                                                codeWard: order.user.codeWard,
                                                codeCity: order.user.codeCity,
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
                                    paymentMethod={order.paymentMethod}
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
                                                if (order.status !== "draft") return <span>{value}</span>;
                                                return (
                                                    <InputNumber
                                                        min={1}
                                                        value={value}
                                                        onChange={(newValue) =>
                                                            handleQuantityChange(newValue, index)
                                                        }
                                                        style={{ width: 80 }}
                                                    />
                                                );
                                            },
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
                                totalFee={Math.max(0, (order.shippingFee ?? 0) - (order.discountAmount ?? 0))}
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