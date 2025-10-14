import React from "react";
import { Button, Divider, Typography } from "antd";
import { GiftOutlined, TagOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Promotion } from "../../../../../types/promotion";

const { Text } = Typography;

interface Props {
  shippingFee: number;
  discountAmount: number;
  totalFee: number;
  selectedPromo: Promotion | null;
  setSelectedPromo: (value: Promotion | null) => void;
  setShowPromoModal: (value: boolean) => void;
  disabled: boolean;
}

const PromotionCard: React.FC<Props> = ({
  shippingFee,
  discountAmount,
  totalFee,
  selectedPromo,
  setSelectedPromo,
  setShowPromoModal,
  disabled,
}) => {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Phí dịch vụ:</Text>
        <div>{shippingFee.toLocaleString()} VNĐ</div>
      </div>

      {discountAmount > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>Giảm giá:</Text>
          <div>-{discountAmount.toLocaleString()} VNĐ</div>
        </div>
      )}

      <Divider style={{ margin: "8px 0" }} />

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>Tổng phí:</Text>
        <div style={{ fontSize: 18, color: "#FF4D4F" }}>
          {totalFee.toLocaleString()} VNĐ
        </div>
      </div>

      <Button
        type="dashed"
        block
        style={{ marginBottom: 16, borderColor: "#1C3D90", color: "#1C3D90" }}
        icon={selectedPromo ? <TagOutlined /> : <GiftOutlined />}
        onClick={() => setShowPromoModal(true)}
        disabled={disabled}
      >
        {selectedPromo ? "Đổi mã khuyến mãi" : "Chọn mã khuyến mãi"}
      </Button>

      {selectedPromo && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            background: "#f6ffed",
            border: "1px solid #b7eb8f",
            borderRadius: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Text strong style={{ color: "#389e0d" }}>
              1 mã giảm giá đã áp dụng:
            </Text>
             <div>{selectedPromo.code}</div>
          </div>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => setSelectedPromo(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PromotionCard;