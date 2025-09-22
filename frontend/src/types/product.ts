export interface product {
  id: number;
  name: string;
  weight: number;
  type: string;
  createdAt: Date,
  totalSold: number,
  status: 'Active' | 'Inactive';
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
}