import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderHistoryAPI, transactionAPI } from '../services/api';
import { Transaction, TransactionResponse, TransactionState } from '../types/transaction';
import { OrderHistoryResponse, OrderHistoryState } from '../types/orderHistory';

const initialState: OrderHistoryState = {
  loading: false,
  error: null,
  warehouse: { // khởi tạo 1 object mặc định
    incomingOrders: [],
    inWarehouseOrders: [],
    exportedOrders: [],
    incomingCount: 0,
    inWarehouseCount: 0,
    exportedCount: 0,
  },
};

export const getWarehouseImportExportStatsByManager = createAsyncThunk<
  OrderHistoryResponse,
  {
    searchText?: string;
    serviceType?: number;
    sort?: string;
  },
  { rejectValue: string }
>(
  'order-histories/getWarehouseImportExportStatsByManager',
  async ({ searchText, sort, serviceType }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (searchText) params.append("search", searchText);
      if (sort) params.append("sort", sort);
      if (serviceType) params.append("serviceType", serviceType.toString());

      const data = await orderHistoryAPI.getWarehouseImportExportStatsByManager(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lấy thông tin kho hàng của bưu cục thất bại');
    }
  }
);

const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState,
  reducers: {
    clearOrderHistoryError: (state) => {
      state.error = null;
    },
    setOrderHistory: (state, action: PayloadAction<Transaction>) => {
      // state.orderHistory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWarehouseImportExportStatsByManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWarehouseImportExportStatsByManager.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.warehouse) {
          state.warehouse = action.payload.warehouse;
        }
      })
      .addCase(getWarehouseImportExportStatsByManager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderHistoryError, setOrderHistory } = orderHistorySlice.actions;
export default orderHistorySlice.reducer;