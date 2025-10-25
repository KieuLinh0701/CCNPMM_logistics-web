import React from "react";
import { Table, Button, Space, message, Tooltip } from "antd";
import { EyeOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { translateOrderPayer, translateOrderPaymentMethod } from "../../../../../utils/orderUtils";
import { Order } from "../../../../../types/order";

interface Props {
  orders: Order[];
  role?: string;
  onDetail: (trackingNumber: string) => void;
}

const OrderTable: React.FC<Props> = ({ orders, role, onDetail }) => {
  const navigate = useNavigate();

  const tableData = orders.map((o) => ({ ...o, key: String(o.id) }));

  const columns: ColumnsType<any> = [
    {
      title: "Mã đơn",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      align: "center",
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => navigate(`/${role}/orders/detail/${record.trackingNumber}`)}
            style={{ padding: 0 }}
          >
            {record.trackingNumber}
          </Button>
          <Tooltip title="Copy mã đơn hàng">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(text);
                message.success('Đã copy mã đơn hàng!');
              }}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
        </Space>
      ),
    },
    { title: "Giá trị đơn (VNĐ)", dataIndex: "orderValue", key: "orderValue", align: "center" },
    { title: "Phí dịch vụ (VNĐ)", dataIndex: "totalFee", key: "totalFee", align: "center" },
    { title: "COD (VNĐ)", dataIndex: "cod", key: "cod", align: "center" },
    { title: "Khối lượng (Kg)", dataIndex: "weight", key: "weight", align: "center" },
    {
      title: "Người thanh toán",
      dataIndex: "payer",
      key: "payer",
      align: "center",
      render: (payer) => (
        translateOrderPayer(payer)
      )
    },
    {
      title: "Phương thức thanh toán",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      render: (method) => (
        translateOrderPaymentMethod(method)
      )
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 250,
      render: (_, record: Order) => {

        return (
          <Space>
            {/* Nút Xem */}
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onDetail(record.trackingNumber)}
            >
              Xem
            </Button>
          </Space>
        );
      }
    }
  ];

  return <Table columns={columns} dataSource={tableData} rowKey="key" scroll={{ x: "max-content" }} />;
};

export default OrderTable;