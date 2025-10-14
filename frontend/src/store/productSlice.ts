import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { productAPI } from '../services/api';
import { ImportProductResult, ImportProductsResponse, product, ProductResponse, ProductState } from '../types/product';

const initialState: ProductState = {
  product: null,
  products: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  types: [],
  statuses: [],
  importResults: null,
  totalImported: 0,
  totalFailed: 0,
  createdProducts: [],
  failedProducts: [],
  nextCursor: null,
};

// Lấy Danh sách sản phẩm của cửa hàng
export const getProductTypes = createAsyncThunk(
  'products/get-types',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy loại hàng hóa thất bại');
    }
  }
);

export const listUserProducts = createAsyncThunk<
  ProductResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    type?: string;
    status?: string;
    sort?: string;
    stock?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'products',
  async ({ page, limit, searchText, type, status, sort, startDate, endDate, stock }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (stock) params.append("stock", stock);

      const data = await productAPI.listUserProducts(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm của cửa hàng');
    }
  }
);

// Lấy Status Enum
export const getProductStatuses = createAsyncThunk(
  'products/get-statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productAPI.getProductStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái làm việc thất bại');
    }
  }
);

// Add Product
export const createProduct = createAsyncThunk<
  ProductResponse,
  Partial<product>,
  { rejectValue: string }
>(
  'products/add',
  async (product, thunkAPI) => {
    try {
      const data = await productAPI.createProduct(product);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi thêm sản phẩm');
    }
  }
);

// Update Product
export const updateProduct = createAsyncThunk<
  ProductResponse,
  { product: Partial<product> },
  { rejectValue: string }
>(
  'products/update',
  async ({ product }, thunkAPI) => {
    try {
      const data = await productAPI.updateProduct(product);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật sản phẩm');
    }
  }
);

// Import Products
export const importProducts = createAsyncThunk<
  ImportProductsResponse,
  { products: Partial<product>[] },
  { rejectValue: string }
>(
  'products/import',
  async ({ products }, thunkAPI) => {
    try {
      const data = await productAPI.importProducts(products);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi import sản phẩm');
    }
  }
);

export const listActiveUserProducts = createAsyncThunk<
  ProductResponse,
  {
    limit: number,
    searchText?: string;
    lastId?: number;
  },
  { rejectValue: string }
>(
  'products/get-active',
  async ({ limit, searchText, lastId }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (lastId) params.append("lastId", String(lastId));

      const data = await productAPI.listActiveUserProducts(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm của cửa hàng');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setProduct: (state, action: PayloadAction<product>) => {
      state.product = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Statused 
    builder
      .addCase(getProductStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getProductStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    // Get Types Enum
    builder
      .addCase(getProductTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductTypes.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.types) {
          state.types = action.payload.types;
        }
      })
      .addCase(getProductTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Products By User
    builder
      .addCase(listUserProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listUserProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.products = action.payload.products || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listUserProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Product
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        const newProduct = action.payload.product;
        if (action.payload.success && newProduct) {
          state.products = [newProduct, ...(state.products || [])];
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.product) {
          const index = state.products.findIndex(emp => emp.id === action.payload.product?.id);
          if (index !== -1) {
            state.products[index] = action.payload.product;
          }
          state.product = action.payload.product;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Import Products
    builder
      .addCase(importProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importProducts.fulfilled, (state, action) => {
        state.loading = false;

        const importData = action.payload;

        if (importData.success) {
          state.importResults = importData.results || null;
          state.totalImported = importData.totalImported || 0;
          state.totalFailed = importData.totalFailed || 0;
          state.createdProducts = importData.createdProducts || [];
          state.failedProducts = importData.failedProducts || [];

          importData.results?.forEach((r: ImportProductResult) => {
            if (r.success && r.product) {
              state.products.unshift(r.product);
            }
          });
        }
      })
      .addCase(importProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.importResults = null;
        state.totalImported = 0;
        state.totalFailed = 0;
        state.createdProducts = [];
        state.failedProducts = [];
      });

    // Get Active Products By User
    builder
      .addCase(listActiveUserProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listActiveUserProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          if (action.meta.arg.lastId) {
            state.products = [...state.products, ...(action.payload.products || [])];
          } else {
            state.products = action.payload.products || [];
          }
          state.total = action.payload.total || 0;
          state.limit = action.payload.limit || 10;
          state.nextCursor = action.payload.nextCursor || null;
        }
      })
      .addCase(listActiveUserProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductError, setProduct } = productSlice.actions;
export default productSlice.reducer;