import React from "react";
import { Order } from "../../../../../types/order";
import { City, Ward } from "../../../../../types/location";

interface Props {
  order: Order;
  cityList: City[];
  wardList: Ward[];
  styles: { [key: string]: React.CSSProperties };
}

const CustomerInfo: React.FC<Props> = ({ order, cityList, wardList, styles }) => {
  const provinceName = cityList.find(p => p.code === Number(order.recipientCityCode))?.name || "";
  const wardName = wardList.find(w => w.code === Number(order.recipientWardCode))?.name || "";

  return (
    <div style={styles.infoBox}>
      <h3>Thông tin khách hàng</h3>
      <p><strong>Tên người nhận:</strong> {order.recipientName}</p>
      <p><strong>Số điện thoại:</strong> {order.recipientPhone}</p>
      <p>
        <strong>Địa chỉ: </strong>
        {order.recipientDetailAddress}, {wardName}, {provinceName}
      </p>
    </div>
  );
};

export default CustomerInfo;