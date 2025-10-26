import React from "react";
import { City, Ward } from "../../../../../types/location";
import { getWardName } from "../../../../../utils/orderUtils";
import { Tag } from "antd";
import Title from "antd/es/typography/Title";

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
  <div
    style={{
      display: "flex",
      gap: 60,
      flexWrap: "wrap",
      paddingLeft: 32,
      paddingRight: 32,
      background: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}
  >
    {/* Thông tin người gửi */}
    <div style={{ flex: 1, minWidth: 220 }}>
      <Title level={5} style={{ color: "#1C3D90"}}>Thông tin người gửi</Title>
      <p style={{ marginBottom: 10 }}>
        <strong>Tên:</strong> {sender.name || <Tag>N/A</Tag>}
      </p>
      <p style={{ marginBottom: 10 }}>
        <strong>Số điện thoại:</strong> {sender.phone || <Tag>N/A</Tag>}
      </p>
      <p style={{ marginBottom: 10 }}>
        <strong>Địa chỉ:</strong> {sender.detailAddress || <Tag>N/A</Tag>},{" "}
        {getWardName(sender.wardCode, sender.wardList) || <Tag>N/A</Tag>},{" "}
        {sender.city?.name || <Tag>N/A</Tag>}
      </p>
    </div>

    {/* Thông tin người nhận */}
    <div style={{ flex: 1, minWidth: 220 }}>
      <Title level={5} style={{ color: "#1C3D90" }}>Thông tin người nhận </Title>
      <p style={{ marginBottom: 10 }}>
        <strong>Tên:</strong> {recipient.name || <Tag>N/A</Tag>}
      </p>
      <p style={{ marginBottom: 10 }}>
        <strong>Điện thoại:</strong> {recipient.phone || <Tag>N/A</Tag>}
      </p>
      <p style={{ marginBottom: 10 }}>
        <strong>Địa chỉ:</strong> {recipient.detailAddress || <Tag>N/A</Tag>},{" "}
        {getWardName(recipient.wardCode, recipient.wardList) || <Tag>N/A</Tag>},{" "}
        {recipient.city?.name || <Tag>N/A</Tag>}
      </p>
    </div>
  </div>
);

export default SenderRecipientInfo;