import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { message, Modal } from "antd";
import { AppDispatch } from "../../../../store/store";
import { Order } from "../../../../types/order";
import { City, Ward } from "../../../../types/location";
import { cancelUserOrder, createVNPayURL, getOrderByTrackingNumber, setOrderToPending } from "../../../../store/orderSlice";

import Header from "./components/Header";
import OrderSenderRecipient from "./components/SenderRecipientInfo";
import OrderInfo from "./components/OrderInfo";
import OrderProducts from "./components/ProductsInfo";
import OrderPayment from "./components/PaymentInfo";
import OrderActions from "./components/Actions";
import FeedbackCard from "./components/FeedbackCard";
import { styles } from "../style/Order.styles";
import { userInfo } from "os";
import { useAppSelector } from "../../../../hooks/redux";
import OrderHistoryCard from "./components/OrderHistoryCard";

const OrderDetail: React.FC = () => {
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useAppSelector(state => state.auth);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const [provinces, setCitys] = useState<City[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!trackingNumber) return;
            try {
                const resp = await dispatch(getOrderByTrackingNumber(trackingNumber)).unwrap();
                setOrder(resp.order ?? null);
            } catch (error) {
                console.error("Lỗi lấy chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [dispatch, trackingNumber]);

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

    const handleEdit = () => {
        if (order?.id && user) navigate(`/${user.role}/orders/edit/${order.trackingNumber}`);
    };

    const handlePayment = async () => {
        if (!order || typeof order.id !== "number") return;
        try {
            const res = await dispatch(createVNPayURL(order.id)).unwrap();
            if (res.paymentUrl) window.location.href = res.paymentUrl;
        } catch (error) {
            console.error("Lỗi tạo URL thanh toán:", error);
        }
    };

    const handleCancelOrder = () => {
        Modal.confirm({
            title: "Xác nhận hủy đơn hàng",
            content: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
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
                try {
                    if (!order?.id) return;
                    const resultAction = await dispatch(cancelUserOrder(order.id)).unwrap();
                    if (resultAction.success) {
                        message.success("Hủy đơn hàng thành công");
                        setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
                    } else {
                        message.error(resultAction.message || "Hủy đơn thất bại");
                    }
                } catch (error: any) {
                    message.error(error.message || "Lỗi server khi hủy đơn hàng");
                }
            },
        });
    };

    const handlePublic = () => {
        Modal.confirm({
            title: "Xác nhận chuyển đơn hàng sang xử lý",
            content: "Bạn có chắc chắn muốn chuyển đơn hàng này sang trạng thái xử lý không?",
            okText: "Có",
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
                try {
                    if (!order?.id) return;
                    const result = await dispatch(setOrderToPending({
                        orderId: order.id
                    })).unwrap();

                    if (result.success) {
                        message.success(result.message || "Đã chuyển đơn hàng sang xử lý thành công");

                        setOrder(prev => prev ? { ...prev, status: "pending" } : prev);
                    } else {
                        message.error(result.message || "Chuyển trạng thái thất bại");
                    }
                } catch (error: any) {
                    console.error("Update status to pending failed:", error);
                    message.error(error.message || "Lỗi khi chuyển trạng thái đơn hàng");
                }
            },
        });
    };

    if (loading || !order) {
        return <div>Đang tải chi tiết đơn hàng...</div>;
    }

    const senderCity = provinces.find((p) => p.code === Number(order.senderCityCode)) || null;
    const recipientCity = provinces.find((p) => p.code === Number(order.recipientCityCode)) || null;

    const senderWard = wards.find((w) => w.code === Number(order.senderWardCode));
    const recipientWard = wards.find((w) => w.code === Number(order.recipientWardCode));

    const totalServiceFee = (order.totalFee || 0) - (order.discountAmount || 0);
    const canEdit = ["draft", "pending", "confirmed"].includes(order.status);
    const canPublic = ["draft"].includes(order.status);
    const canPayStatus = ["pending"].includes(order.status);
    const canPay =
        order.paymentMethod !== "Cash" && order.paymentStatus === "Unpaid" && canPayStatus;
    const canCancel = ["draft", "pending", "confirmed"].includes(order.status) && order.createdByType === "user";

    return (
        <div style={styles.container}>
            {user && (
                <Header
                    trackingNumber={order.trackingNumber!}
                    role={user.role}
                />
            )}
            <OrderSenderRecipient
                sender={{
                    name: order.senderName,
                    phone: order.senderPhone,
                    detailAddress: order.senderDetailAddress,
                    wardCode: order.senderWardCode,
                    city: senderCity,
                    wardList: senderWard ? [senderWard] : [],
                }}
                recipient={{
                    name: order.recipientName,
                    phone: order.recipientPhone,
                    detailAddress: order.recipientDetailAddress,
                    wardCode: order.recipientWardCode,
                    city: recipientCity,
                    wardList: recipientWard ? [recipientWard] : [],
                }}
            />
            <OrderInfo order={order} />
            <OrderProducts products={order.orderProducts || []} />
            <div style={{ marginBottom: 30 }}>
              <OrderHistoryCard histories={order.histories} />
            </div>
            <FeedbackCard orderId={order.id} orderStatus={order.status} />
            <OrderPayment order={order} totalServiceFee={totalServiceFee} />
            <OrderActions
                canPublic={canPublic}
                canEdit={canEdit}
                canCancel={canCancel}
                canPay={canPay}
                onPublic={handlePublic}
                onEdit={handleEdit}
                onCancel={handleCancelOrder}
                onPay={handlePayment}
            />
        </div>
    );
};

export default OrderDetail;