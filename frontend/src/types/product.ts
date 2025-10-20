import { Order } from "./order";

export interface product {
  id: number;
  name: string;
  weight: number;
  price: number,
  type: string;
  createdAt: Date,
  totalSold: number,
  status: 'Active' | 'Inactive';
  stock: number;
  soldQuantity: number;
}

export interface ProductAnalyticsReponse {
  success: boolean;
  outOfStockProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  productByType: {type: string, total: number}[];
  soldByDate: {date: Date, total: number}[];
  topSelling: {id: number, name: string, total: number}[];
  topReturned: {id: number, name: string, total: number}[];
}

export interface ImportProductResult {
  name: string;        
  success: boolean;    
  message: string;     
  product?: product;   
}

export interface ImportProductsResponse {
  success: boolean;
  message: string;
  totalImported: number;
  totalFailed: number;
  createdProducts: string[];
  failedProducts: { name: string; message: string }[];
  results: ImportProductResult[];
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  product?: product;
  products: product[];
  total?: number,
  page?: number,
  limit?: number,
  types?: string[],
  statuses?: string[];
  nextCursor?: number;
}

export interface ProductState {
  product?: product | null;
  loading: boolean;
  error: string | null;
  products: product[];
  total: number;
  page: number;
  limit: number;
  types: string[];
  statuses: string[];

  importResults?: ImportProductResult[] | null;
  totalImported?: number;
  totalFailed?: number;
  createdProducts?: string[];
  failedProducts?: { name: string; message: string }[];

  outOfStockProducts?: number;
  activeProducts?: number;
  inactiveProducts?: number;
  productByType: {type: string, total: number}[] | null;
  soldByDate?: {date: Date, total: number}[] | null;
  topSelling?: {id: number, name: string, total: number}[] | null;
  topReturned?: {id: number, name: string, total: number}[] | null;

  nextCursor?: number | null;
}