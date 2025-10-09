import React from "react";
import { styles } from "../../style/Order.styles";
import { OrderProduct } from "../../../../../types/orderProduct";

interface Props {
  products: OrderProduct[];
}

const ProductsInfo: React.FC<Props> = ({ products }) => {
  if (!products.length) return null;

  return (
    <div style={styles.productList}>
      <h3>Sản phẩm trong đơn hàng</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Tên sản phẩm</th>
            <th style={styles.th}>Khối lượng</th>
            <th style={styles.th}>Giá tiền (VNĐ)</th>
            <th style={styles.th}>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={index}>
              <td style={styles.td}>{item.product.name}</td>
              <td style={styles.td}>{item.product.weight}</td>
              <td style={styles.td}>{item.product.price}</td>
              <td style={styles.td}>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsInfo;