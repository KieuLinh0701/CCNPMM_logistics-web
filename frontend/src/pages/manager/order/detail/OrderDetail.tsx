import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { message, Modal } from "antd";
import { AppDispatch } from "../../../../store/store";
import { Order } from "../../../../types/order";
import { City, Ward } from "../../../../types/location";
import { cancelManagerOrder, cancelUserOrder, confirmAndAssignOrder, createVNPayURL, getOrderByTrackingNumber, setOrderToPending } from "../../../../store/orderSlice";

import Header from "./components/Header";
import OrderSenderRecipient from "./components/SenderRecipientInfo";
import OrderInfo from "./components/OrderInfo";
import OrderProducts from "./components/ProductsInfo";
import OrderPayment from "./components/PaymentInfo";
import OrderActions from "./components/Actions";
import { useAppSelector } from "../../../../hooks/redux";
import OrderHistoryCard from "./components/OrderHistoryCard";
import { styles } from "../../../user/order/style/Order.styles";
import { getByUserId, getOfficesByArea } from "../../../../store/officeSlice";
import OfficeSelectionModal from "./components/OfficeSelectionModal";

const ManagerOrderDetail: React.FC = () => {
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useAppSelector(state => state.auth);

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const [provinces, setCitys] = useState<City[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const { office, offices = [] } = useAppSelector(state => state.office);

    const [isOfficeSelectionModalVisible, setIsOfficeSelectionModalVisible] = useState(false);

    const [provinceList, setProvinceList] = useState<{ code: number; name: string }[]>([]);
    const [wardList, setWardList] = useState<{ code: number; name: string }[]>([]);

    // --- Fetch province/ward ---
    useEffect(() => {
        // Fetch provinces
        axios
            .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/p/")
            .then((res) => setProvinceList(res.data))
            .catch((err) => console.error(err));

        // Fetch wards
        axios
            .get<{ code: number; name: string }[]>("https://provinces.open-api.vn/api/v2/w/")
            .then((res) => setWardList(res.data))
            .catch((err) => console.error(err));
    });

    useEffect(() => {
        if (!office && user?.id !== undefined) {
            dispatch(getByUserId(user.id));
        }
    }, [dispatch]);

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
        if (!order?.id || !user) return;
        navigate(`/${user.role}/orders/edit/${order.trackingNumber}`);
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
                    const resultAction = await dispatch(cancelManagerOrder(order.id)).unwrap();
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

    // Hàm xử lý khi nhấn nút "Duyệt"
    const handleApprove = async () => {
        if (!order) return;

        // Lấy danh sách offices theo city của người nhận
        if (order?.recipientCityCode) {
            try {
                await dispatch(getOfficesByArea({ codeCity: order.recipientCityCode })).unwrap();
                setIsOfficeSelectionModalVisible(true);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách bưu cục:', error);
                message.error('Không thể tải danh sách bưu cục');
            }
        } else {
            setIsOfficeSelectionModalVisible(true);
        }
    };

    // Hàm hủy xác nhận
    const handleCancel = () => {
        setIsOfficeSelectionModalVisible(false);
    };

    const handleConfirm = async (officeId: number) => {
        if (order) {
            try {
                const result = await dispatch(confirmAndAssignOrder({
                    orderId: order.id,
                    officeId
                })).unwrap();

                if (result.success) {
                    message.success(result.message || 'Xác nhận đơn hàng thành công');

                    const refreshed = await dispatch(getOrderByTrackingNumber(order.trackingNumber)).unwrap();
                    setOrder(refreshed.order ?? null);
                } else {
                    message.error(result.message || 'Xác nhận đơn hàng thất bại');
                }

            } catch (error: any) {
                message.error(error.message || 'Lỗi khi xác nhận đơn hàng');
            }
        }

        setIsOfficeSelectionModalVisible(false);
    };

    if (loading || !order || !office) {
        return <div>Đang tải chi tiết đơn hàng...</div>;
    }

    const senderCity = provinces.find((p) => p.code === Number(order.senderCityCode)) || null;
    const recipientCity = provinces.find((p) => p.code === Number(order.recipientCityCode)) || null;

    const senderWard = wards.find((w) => w.code === Number(order.senderWardCode));
    const recipientWard = wards.find((w) => w.code === Number(order.recipientWardCode));

    const totalServiceFee = (order.shippingFee || 0) - (order.discountAmount || 0);
    const canApprove = order.status === "pending";
    const canCancel = ["picked_up", "confirmed"].includes(order.status);
    const canEdit = !!(
        office && (
            (["confirmed", "picked_up"].includes(order.status) &&
                order.fromOffice?.id === office.id) ||
            (order.status === "in_transit" &&
                order.toOffice?.id === office.id)
        )
    );

    const hasPaymentIssue =
        order.paymentMethod !== "Cash" && order.paymentStatus === "Unpaid";

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
            <OrderHistoryCard histories={order.histories} />
            <OrderPayment order={order} totalServiceFee={totalServiceFee} />
            <OrderActions
                canApprove={canApprove}
                canEdit={canEdit}
                canCancel={canCancel}
                hasPaymentIssue={hasPaymentIssue}
                onApprove={handleApprove}
                onEdit={handleEdit}
                onCancel={handleCancelOrder}
            />

            {order &&
                <OfficeSelectionModal
                    open={isOfficeSelectionModalVisible}
                    recipient={{
                        detailAddress: order.recipientDetailAddress,
                        wardCode: order.recipientWardCode,
                        cityCode: order.recipientCityCode,
                    }}
                    wardList={wardList}
                    provinceList={provinceList}
                    offices={offices}
                    trackingNumber={order.trackingNumber}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            }
        </div>
    );
};

export default ManagerOrderDetail;