import React from "react";
import { Table, Tabs, Spin, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { OrderHistory } from "../../../../types/orderHistory";
import { translateOrderStatus } from "../../../../utils/orderUtils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Link, useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const { TabPane } = Tabs;

interface WarehouseTableProps {
    incomingOrders: OrderHistory[];
    inWarehouseOrders: OrderHistory[];
    exportedOrders: OrderHistory[];
    loading?: boolean;
    activeTab: string;
    onTabChange: (key: string) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({
    incomingOrders,
    inWarehouseOrders,
    exportedOrders,
    loading = false,
    activeTab,
    onTabChange,
}) => {
    const navigate = useNavigate();

    const statusTag = (status: string) => {
        switch (status) {
            case "draft": return <Tag color="default">{translateOrderStatus(status)}</Tag>;
            case "pending": return <Tag color="orange">{translateOrderStatus(status)}</Tag>;
            case "confirmed": return <Tag color="blue">{translateOrderStatus(status)}</Tag>;
            case "picked_up": return <Tag color="purple">{translateOrderStatus(status)}</Tag>;
            case "in_transit": return <Tag color="cyan">{translateOrderStatus(status)}</Tag>;
            case "delivered": return <Tag color="green">{translateOrderStatus(status)}</Tag>;
            case "cancelled": return <Tag color="red">{translateOrderStatus(status)}</Tag>;
            case "returned": return <Tag color="gold">{translateOrderStatus(status)}</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns: ColumnsType<OrderHistory> = [
        {
            title: "Mã đơn hàng",
            key: "trackingNumber",
            align: "center",
            render: (_, record) => (
                record.order?.trackingNumber ? (
                    <span
                        style={{ fontWeight: 600, cursor: "pointer", userSelect: "text", color: '#1C3D90' }}
                        onClick={() => navigate(`/manager/orders/detail/${record.order.trackingNumber}`)}
                    >
                        {record.order.trackingNumber}
                    </span>
                ) : (
                    <Tag color="default">N/A</Tag>
                )
            ),
        },
        {
            title: "Trọng lượng (Kg)",
            key: "weight",
            align: "center",
            render: (_, record) => record.order?.weight || 0,
        },
        {
            title: "Dịch vụ",
            key: "serviceType",
            align: "center",
            render: (_, record) => record.order.serviceType?.name || <Tag color="default">N/A</Tag>,
        },
        {
            title: "Trạng thái",
            key: "status",
            align: "center",
            render: (_, record) => statusTag(record.order.status),
        },
        {
            title: "Thời gian",
            key: "actionTime",
            align: "center",
            render: (_, record) =>
                record.actionTime
                    ? dayjs(record.actionTime)
                        .tz("Asia/Ho_Chi_Minh")
                        .format("DD/MM/YYYY HH:mm:ss")
                    : <Tag color="default">N/A</Tag>,
        },
        {
            title: "Ghi chú đơn hàng",
            key: "orderNote",
            align: "center",
            render: (_, record) => (
                <div
                    style={{
                        maxWidth: 200,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        margin: "0 auto",
                    }}
                    title={record.order.notes}
                >
                    {record.order.notes || <Tag color="default">N/A</Tag>}
                </div>
            ),
        },
        {
            title: "Ghi chú vận chuyển",
            key: "note",
            align: "center",
            render: (_, record) => (
                <div
                    style={{
                        maxWidth: 200,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        margin: "0 auto",
                    }}
                    title={record.note}
                >
                    {record.note || <Tag color="default">N/A</Tag>}
                </div>
            ),
        },
    ];

    return (
        <div>
            <Spin spinning={loading}>
                <Tabs
                    activeKey={activeTab}
                    type="card"
                    tabBarStyle={{
                        fontWeight: 600,
                        fontSize: 16,
                        borderRadius: 12,
                    }}
                    tabBarGutter={12}
                    onChange={onTabChange}
                >
                    <TabPane
                        tab={<div style={{ minWidth: 200, textAlign: "center" }}>Chuẩn bị nhập kho</div>}
                        key="1" style={{ padding: 16, borderRadius: 12 }}>
                        {activeTab === "1" && (
                            <Table
                                columns={columns}
                                dataSource={incomingOrders}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                bordered
                                style={{
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#fff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<div style={{ minWidth: 200, textAlign: "center" }}>Đang trong kho</div>}
                        key="2"
                        style={{ padding: 16, borderRadius: 12 }}
                    >
                        {activeTab === "2" && (
                            <Table
                                columns={columns}
                                dataSource={inWarehouseOrders}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                bordered
                                style={{
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#fff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            />
                        )}
                    </TabPane>

                    <TabPane
                        tab={<div style={{ minWidth: 200, textAlign: "center" }}>Đã xuất kho</div>}
                        key="3"
                        style={{ padding: 16, borderRadius: 12 }}>
                        {activeTab === "3" && (
                            <Table
                                columns={columns}
                                dataSource={exportedOrders}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                bordered
                                style={{
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "#fff",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}
                            />
                        )}
                    </TabPane>
                </Tabs>
            </Spin>
        </div>
    );
};

export default WarehouseTable;