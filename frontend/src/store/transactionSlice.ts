import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionAPI } from '../services/api';
import { Transaction, TransactionResponse, TransactionState } from '../types/transaction';

const initialState: TransactionState = {
  transaction: null,
  transactions: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  types: [],
};

// Lấy Danh sách sản phẩm của cửa hàng
export const getTransactionTypes = createAsyncThunk(
  'transactions/getTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactionTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy loại giao dịch thất bại');
    }
  }
);

export const listUserTransactions = createAsyncThunk<
  TransactionResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    type?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'transactions',
  async ({ page, limit, searchText, type, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (type) params.append("type", type);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await transactionAPI.listUserTransactions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách giao dịch của cửa hàng');
    }
  }
);

export const exportUserTransactions = createAsyncThunk<
  TransactionResponse,
  {
    searchText?: string;
    type?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'transactions/export',
  async ({ searchText, type, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (searchText) params.append("search", searchText);
      if (type) params.append("type", type);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await transactionAPI.exportUserTransactions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách giao dịch của cửa hàng cho việc xuất báo cáo');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transaction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTransactionTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionTypes.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.types) {
          state.types = action.payload.types;
        }
      })
      .addCase(getTransactionTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(listUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.transactions = action.payload.transactions || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

      builder
      .addCase(exportUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.transactions = action.payload.transactions || [];
        }
      })
      .addCase(exportUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionError, setTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;