import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircleTwoTone, CloseCircleOutlined, CreditCardOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from "axios";
import { message, Modal } from 'antd';
import OrderInfo from './components/OrderInfo';
import OrderCustomerInfo from './components/CustomerInfo';
import OrderPaymentInfo from './components/PaymentInfo';
import { AppDispatch } from '../../../../store/store';
import { cancelUserOrder, checkVNPayPayment, createVNPayURL, getOrderByTrackingNumber } from '../../../../store/orderSlice';
import { Order } from '../../../../types/order';
import { City, Ward } from '../../../../types/location';
import OrderHeader from './components/Header';
import OrderActions from './components/Actions';
import { styles } from '../style/Order.styles';
import { useAppSelector } from '../../../../hooks/redux';

const OrderSuccess: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useAppSelector(state => state.auth);

  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [cityList, setCityList] = useState<City[]>([]);
  const [wardList, setWardList] = useState<Ward[]>([]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!trackingNumber) return;
      try {
        const response = await dispatch(getOrderByTrackingNumber(trackingNumber)).unwrap();
        setOrder(response.order ?? null);
      } catch (error) {
        console.error('Lỗi lấy đơn hàng:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [dispatch, trackingNumber]);

  const handleViewDetails = () => {
    if (order?.trackingNumber && user) {
      navigate(`/${user.role}/orders/detail/${order.trackingNumber}`);
    }
  };

  const handlePayment = async () => {
    if (!order || typeof order.id !== 'number') {
      console.error('Không có ID đơn hàng hợp lệ');
      return;
    }
    try {
      const res = await dispatch(createVNPayURL(order.id)).unwrap();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      }
    } catch (error) {
      console.error('Lỗi tạo URL thanh toán:', error);
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
          backgroundColor: "#e0e0e0",
          color: "#333",
        },
      },
      onOk: async () => {
        try {
          if (!order || typeof order.id !== 'number') return;
          const resultAction = await dispatch(cancelUserOrder(order.id)).unwrap();
          if (resultAction.success) {
            message.success("Hủy đơn hàng thành công");
            // Cập nhật lại trạng thái order trong component
            setOrder((prev: Order | null) => prev ? { ...prev, status: 'cancelled' } : prev);
          } else {
            message.error(resultAction.message || "Hủy đơn thất bại");
          }
        } catch (error: any) {
          console.error("Cancel order error:", error);
          message.error(error.message || "Lỗi server khi hủy đơn hàng");
        }
      },
    });
  };

  useEffect(() => {
    axios
      .get<City[]>("https://provinces.open-api.vn/api/v2/p/")
      .then(res => setCityList(res.data))
      .catch(err => console.error(err));
  }, []);

  // wards cho sender
  useEffect(() => {
    if (order?.senderCityCode) {
      axios
        .get<{ wards: Ward[] }>(
          `https://provinces.open-api.vn/api/v2/p/${order.senderCityCode}?depth=2`
        )
        .then(res => setWardList(res.data.wards || []))
        .catch(err => console.error(err));
    }
  }, [order?.senderCityCode]);

  // wards cho recipient
  useEffect(() => {
    if (order?.recipientCityCode) {
      axios
        .get<{ wards: Ward[] }>(
          `https://provinces.open-api.vn/api/v2/p/${order.recipientCityCode}?depth=2`
        )
        .then(res => {
          // gộp thêm wards recipient vào danh sách
          setWardList(prev => [...prev, ...(res.data.wards || [])]);
        })
        .catch(err => console.error(err));
    }
  }, [order?.recipientCityCode]);

  useEffect(() => {
    const queryString = location.search;
    if (queryString) {
      dispatch(checkVNPayPayment(queryString))
        .unwrap()
        .then((res) => {
          if (user) {
            if (res && res.success) {
              window.location.replace(`/${user.role}/orders/success/${trackingNumber}`);
            } else {
              window.location.replace(`/${user.role}/orders/failed/${trackingNumber}`);
            }
          }
        })
        .catch(() => {
          if (user) {
            window.location.replace(`/${user.role}/orders/failed/${trackingNumber}`);
          }
        });
    }
  }, [trackingNumber, location, dispatch, navigate]);

  if (loading || !order) {
    return <div>Đang tải...</div>;
  }

  return (
    <div style={styles.containerSuccess}>
      <div>
        <OrderHeader order={order} styles={styles} />

        <div style={styles.infoContainer}>
          <OrderCustomerInfo order={order} cityList={cityList} wardList={wardList} styles={styles} />
          <OrderInfo order={order} cityList={cityList} wardList={wardList} styles={styles} />
          <OrderPaymentInfo order={order} styles={styles} />
        </div>
        {user &&
          <OrderActions
            order={order}
            styles={styles}
            handleViewDetails={handleViewDetails}
            handlePayment={handlePayment}
            handleCancelOrder={handleCancelOrder}
            role={user.role}
          />
        }
      </div>
    </div>
  );
};

export default OrderSuccess;