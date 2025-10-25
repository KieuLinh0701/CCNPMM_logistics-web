import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { paymentSubmissionAPI, transactionAPI } from '../services/api';
import { PaymentSubmission, PaymentSubmissionResponse, PaymentSubmissionState } from '../types/paymentSubmission';
import { OrderResponse } from '../types/order';

const initialState: PaymentSubmissionState = {
  paymentSubmission: null,
  paymentSubmissions: [],
  loading: false,
  error: null,
  pending: { totalCOD: 0, totalOrderValue: 0, orderCount: 0 },
  confirmed: { totalCOD: 0, totalOrderValue: 0, orderCount: 0 },
  statuses: [],
  orders: [],
  summary: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const getPaymentSubmissionStatuses = createAsyncThunk(
  'paymentSubmissions/getPaymentSubmissionStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentSubmissionAPI.getPaymentSubmissionStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái đối soát thất bại');
    }
  }
);

export const getUserPendingOrdersSummary = createAsyncThunk(
  'paymentSubmissions/getUserPendingOrdersSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentSubmissionAPI.getUserPendingOrdersSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy dòng tiền đang luân chuyển thất bại');
    }
  }
);

export const getUserConfirmedOrdersSummary = createAsyncThunk(
  'paymentSubmissions/getUserConfirmedOrdersSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentSubmissionAPI.getUserConfirmedOrdersSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy dòng tiền đã ký nhận thất bại');
    }
  }
);

export const listManagerPaymentSubmission = createAsyncThunk<
  PaymentSubmissionResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    status?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'submissions/listManagerPaymentSubmission',
  async ({ page, limit, searchText, status, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (status) params.append("status", status);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await paymentSubmissionAPI.listManagerPaymentSubmissions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đôi soát của bưu cục');
    }
  }
);

export const getOrdersOfPaymentSubmission = createAsyncThunk<
  PaymentSubmissionResponse,
  {
    page: number,
    limit: number,
    submissionId: number;
  },
  { rejectValue: string }
>(
  'submissions/getOrdersOfPaymentSubmission',
  async ({ page, limit, submissionId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const data = await paymentSubmissionAPI.getOrdersOfPaymentSubmission(submissionId, params.toString());
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lấy danh sách đơn hàng của đối soát thất bại');
    }
  }
);

export const updatePaymentSubmissionStatus = createAsyncThunk<
  PaymentSubmissionResponse,
  { id: number; status: string; notes?: string },
  { rejectValue: string }
>(
  "submissions/updatePaymentSubmissionStatus",
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const data = await paymentSubmissionAPI.updatePaymentSubmissionStatus(id, status, notes);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật thất bại");
    }
  }
);

export const getPaymentSubmissionCountByStatus = createAsyncThunk<
  PaymentSubmissionResponse
>(
  'submissions/getPaymentSubmissionCountByStatus',
  async (_, thunkAPI) => {
    try {
      const res = await paymentSubmissionAPI.getPaymentSubmissionCountByStatus();
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          'Lỗi khi lấy thống kê đối soát của bưu cục'
      );
    }
  }
);

const paymentSubmissionSlice = createSlice({
  name: 'paymentSubmission',
  initialState,
  reducers: {
    clearPaymentSubmissionError: (state) => {
      state.error = null;
    },
    setPaymentSubmission: (state, action: PayloadAction<PaymentSubmission>) => {
      state.paymentSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentSubmissionStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSubmissionStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getPaymentSubmissionStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getUserPendingOrdersSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserPendingOrdersSummary.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          state.pending = {
            totalCOD: action.payload.totalCOD ?? 0,
            totalOrderValue: action.payload.totalOrderValue ?? 0,
            orderCount: action.payload.orderCount ?? 0,
          };
        }
      })
      .addCase(getUserPendingOrdersSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getUserConfirmedOrdersSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserConfirmedOrdersSummary.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          state.confirmed = {
            totalCOD: action.payload.totalCOD ?? 0,
            totalOrderValue: action.payload.totalOrderValue ?? 0,
            orderCount: action.payload.orderCount ?? 0,
          };
        }

      })
      .addCase(getUserConfirmedOrdersSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(listManagerPaymentSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listManagerPaymentSubmission.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.paymentSubmissions = action.payload.paymentSubmissions || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listManagerPaymentSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getOrdersOfPaymentSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersOfPaymentSubmission.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getOrdersOfPaymentSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updatePaymentSubmissionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSubmissionStatus.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updatePaymentSubmissionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Cập nhật thất bại";
      });

      builder
      .addCase(getPaymentSubmissionCountByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSubmissionCountByStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.summary) {
          state.summary = action.payload.summary;
        }
      })
      .addCase(getPaymentSubmissionCountByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentSubmissionError, setPaymentSubmission } = paymentSubmissionSlice.actions;
export default paymentSubmissionSlice.reducer;