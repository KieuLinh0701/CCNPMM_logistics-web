import React, { useState } from "react";
import { Typography, Collapse, Timeline, Tag } from "antd";
import { OrderHistory } from "../../../../../types/orderHistory";
import dayjs from "dayjs";

const { Title } = Typography;
const { Panel } = Collapse;

interface OrderHistoryCardProps {
  histories: OrderHistory[];
}

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ histories }) => {
  const [activeKey, setActiveKey] = useState<string[]>([]);

  // Sắp xếp cũ nhất dưới
  const sortedHistories = [...histories].sort(
    (a, b) => new Date(a.actionTime).getTime() - new Date(b.actionTime).getTime()
  );

  const getOrderHistoryActionText = (history: OrderHistory) => {
    switch (history.action) {
      case "ReadyForPickup": return "Người gửi đã chuẩn bị hàng xong";
      case "PickedUp": return "Đơn hàng đã được lấy thành công";
      case "Imported": return `Đơn hàng đã nhập kho ${history.toOffice?.name || <Tag color="default">N/A</Tag>}`;
      case "Exported": return `Đơn hàng đã xuất kho ${history.fromOffice?.name || <Tag color="default">N/A</Tag>} đến kho ${history.toOffice?.name || <Tag color="default">N/A</Tag>}`;
      case "Shipping": return "Đơn hàng đang trong quá trình vận chuyển";
      case "Delivered": return "Đơn hàng đã được giao thành công";
      case "Returned": return "Đơn hàng đã được hoàn trả";
      default: return "Cập nhật trạng thái đơn hàng";
    }
  };

  return (
    <Collapse
      activeKey={activeKey}
      onChange={(keys) => setActiveKey(keys as string[])}
      bordered={false}
      expandIconPosition="end"
      style={{ background: "transparent", paddingLeft: 32, paddingRight: 32 }}
    >
      <Panel
        header={<Title level={5} style={{ margin: 0, color: "#1C3D90" }}>Lịch sử đơn hàng</Title>}
        key="1"
        style={{
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          padding: "3px 6px",
        }}
      >
        {histories.length === 0 ? (
          <div style={{ color: "#888" }}>Không có lịch sử</div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            {/* Mũi tên dòng thời gian */}
            <div style={{
              position: 'absolute',
              left: 12,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: '#faad14',
            }} />
            {sortedHistories.map((item, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: 16, position: 'relative' }}>
                {/* Dot / mũi tên nhỏ */}
                <div style={{
                  position: 'absolute',
                  left: -1,
                  top: 0,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#faad14',
                  border: '2px solid #fff',
                }} />
                <div style={{ flex: 1, paddingLeft: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <span>{getOrderHistoryActionText(item)}</span>
                    <span style={{ color: "#888", fontSize: 12 }}>
                      {dayjs(item.actionTime).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </Collapse>
  );
};

export default OrderHistoryCard;