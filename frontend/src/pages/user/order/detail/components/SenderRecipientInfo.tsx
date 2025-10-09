import React from "react";
import { styles } from "../../style/Order.styles";
import { City, Ward } from "../../../../../types/location";
import { getWardName } from "../../../../../utils/orderUtils";

interface Props {
  sender: {
    name: string;
    phone: string;
    detailAddress: string;
    wardCode: number;
    city: City | null;
    wardList: Ward[];
  };
  recipient: {
    name: string;
    phone: string;
    detailAddress: string;
    wardCode: number;
    city: City | null;
    wardList: Ward[];
  };
}

const SenderRecipientInfo: React.FC<Props> = ({ sender, recipient }) => (
  <div style={styles.rowContainer}>
    <div style={styles.section}>
      <h3>Thông tin người gửi</h3>
      <p><strong>Tên:</strong> {sender.name}</p>
      <p><strong>Số điện thoại:</strong> {sender.phone}</p>
      <p>
        <strong>Địa chỉ:</strong> {sender.detailAddress},{" "}
        {getWardName(sender.wardCode, sender.wardList)}, {sender.city?.name}
      </p>
    </div>

    <div style={styles.section}>
      <h3>Thông tin người nhận</h3>
      <p><strong>Tên:</strong> {recipient.name}</p>
      <p><strong>Điện thoại:</strong> {recipient.phone}</p>
      <p>
        <strong>Địa chỉ:</strong> {recipient.detailAddress},{" "}
        {getWardName(recipient.wardCode, recipient.wardList)}, {recipient.city?.name}
      </p>
    </div>
  </div>
);

export default SenderRecipientInfo;