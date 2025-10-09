import { Order } from "./order";
import { product } from "./product";

export interface OrderProduct {
  product: product;
  quantity: number,
  price: number,
  order?: Order | null,
}

export interface OrderProductResponse {
  success: boolean;
  message?: string;
  orderProduct?: OrderProduct;
  orderProducts: OrderProduct[];
}

export interface ProductState {
  loading: boolean;
  error: string | null;
}