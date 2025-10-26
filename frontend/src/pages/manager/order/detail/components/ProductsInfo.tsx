import React from "react";
import { OrderProduct } from "../../../../../types/orderProduct";
import { Tag } from "antd";
import Title from "antd/es/typography/Title";

interface Props {
  products: OrderProduct[];
}

const ProductsInfo: React.FC<Props> = ({ products }) => {
  if (!products.length) return null;

  return (
    <div
      style={{
        paddingLeft: 32,
        paddingRight: 32,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        marginBottom: 32,
      }}
    >
      <Title level={5} style={{ color: "#1C3D90"}}>Sản phẩm trong đơn hàng</Title>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "8px 12px", textAlign: "left" }}>Tên sản phẩm</th>
            <th style={{ padding: "8px 12px", textAlign: "right" }}>Khối lượng</th>
            <th style={{ padding: "8px 12px", textAlign: "right" }}>Giá tiền (VNĐ)</th>
            <th style={{ padding: "8px 12px", textAlign: "right" }}>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "8px 12px" }}>{item.product.name}</td>
              <td style={{ padding: "8px 12px", textAlign: "right" }}>{item.product.weight}</td>
              <td style={{ padding: "8px 12px", textAlign: "right" }}>{item.product.price.toLocaleString()}</td>
              <td style={{ padding: "8px 12px", textAlign: "right" }}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsInfo;