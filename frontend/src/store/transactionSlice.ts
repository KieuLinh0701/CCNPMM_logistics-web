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
  statuses: [],
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
};

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

export const getTransactionStatuses = createAsyncThunk(
  'transactions/getStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactionStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy trạng thái giao dịch thất bại');
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
  'transactions/listUserTransactions',
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
  'transactions/exportUserTransactions',
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

// ========================== Manager ========================

export const listManagerTransactions = createAsyncThunk<
  TransactionResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    type?: string;
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'transactions/listManagerTransactions',
  async ({ page, limit, searchText, type, status, sort, startDate, endDate }, thunkAPI) => {
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

      const data = await transactionAPI.listManagerTransactions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách giao dịch của bưu cục');
    }
  }
);

export const exportManagerTransactions = createAsyncThunk<
  TransactionResponse,
  {
    searchText?: string;
    type?: string;
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'transactions/exportManagerTransactions',
  async ({ searchText, type, status, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (searchText) params.append("search", searchText);
      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await transactionAPI.exportManagerTransactions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách giao dịch của bưu cục cho việc xuất báo cáo');
    }
  }
);

export const getManagerTransactionSummary = createAsyncThunk<
  TransactionResponse,
  {
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'transactions/getManagerTransactionSummary',
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await transactionAPI.getManagerTransactionSummary(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy tổng thu - chi của bưu cục');
    }
  }
);

// Tạo transaction mới
export const createTransaction = createAsyncThunk<
  TransactionResponse,
  {
    amount: number;
    title: string;
    notes: string;
    images: File[];
  },
  { rejectValue: string }
>(
  'transactions/createTransaction',
  async (payload, thunkAPI) => {
    try {
      // FormData để upload file
      const formData = new FormData();
      formData.append('amount', payload.amount.toString());
      if (payload.notes) formData.append('notes', payload.notes);
      if (payload.title) formData.append('title', payload.title);

      if (payload.images && payload.images.length > 0) {
        payload.images.forEach((file, index) => {
          formData.append('images', file);
        });
      }

      const data = await transactionAPI.createTransaction(formData);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Tạo giao dịch thất bại');
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
      .addCase(getTransactionStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getTransactionStatuses.rejected, (state, action) => {
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

    builder
      .addCase(listManagerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listManagerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.transactions = action.payload.transactions || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listManagerTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(exportManagerTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportManagerTransactions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.transactions = action.payload.transactions || [];
        }
      })
      .addCase(exportManagerTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getManagerTransactionSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagerTransactionSummary.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.totalExpense = action.payload.totalExpense || 0;
          state.totalIncome = action.payload.totalIncome || 0;
          state.balance = action.payload.balance || 0;
          console.log("state", action.payload)
        }
      })
      .addCase(getManagerTransactionSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
          state.total += 1;
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionError, setTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;