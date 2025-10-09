import React from "react";
import { Order } from "../../../../../types/order";
import { City, Ward } from "../../../../../types/location";

interface Props {
  order: Order;
  cityList: City[];
  wardList: Ward[];
  styles: { [key: string]: React.CSSProperties };
}

const OrderInfo: React.FC<Props> = ({ order, cityList, wardList, styles }) => {
  const provinceName = cityList.find(p => p.code === Number(order.senderCityCode))?.name || "";
  const wardName = wardList.find(w => w.code === Number(order.senderWardCode))?.name || "";

  return (
    <div style={styles.infoBox}>
      <h3>Thông tin đơn hàng</h3>
      <p>
        <strong>Địa chỉ lấy hàng: </strong>
        {order.senderDetailAddress}, {wardName}, {provinceName}
      </p>
      <p><strong>Ngày tạo:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Không rõ"}</p>
      <p><strong>Dịch vụ vận chuyển:</strong> {order.serviceType.name}</p>
      <p><strong>Phí dịch vụ:</strong> {((order.shippingFee || 0) - (order.discountAmount || 0)).toLocaleString()} VNĐ</p>
      <p><strong>Trọng lượng:</strong> {order.weight} kg</p>
      <p><strong>COD:</strong> {order.cod?.toLocaleString()} VNĐ</p>
    </div>
  );
};

export default OrderInfo;
