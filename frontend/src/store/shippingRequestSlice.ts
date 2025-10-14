import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShippingRequest, ShippingRequestResponse, ShippingRequestState } from '../types/shippingRequest';
import { requestAPI } from '../services/api';

const initialState: ShippingRequestState = {
  request: null,
  requests: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  requestTypes: [],
  statuses: [],
};

export const getRequestTypes = createAsyncThunk(
  'requests/get-types',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestAPI.getRequestTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy loại yêu cầu thất bại');
    }
  }
);

export const getRequestStatuses = createAsyncThunk(
  'requests/get-statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestAPI.getRequestStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy trạng thái yêu cầu thất bại');
    }
  }
);

export const listUserRequests = createAsyncThunk<
  ShippingRequestResponse,
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
  'requests',
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

      const data = await requestAPI.listUserRequests(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách yêu cầu của cửa hàng');
    }
  }
);

// Add Request
export const createRequest = createAsyncThunk<
  ShippingRequestResponse,
  Partial<ShippingRequest>,
  { rejectValue: string }
>(
  'requests/add',
  async (request, thunkAPI) => {
    try {
      const data = await requestAPI.createRequest(request);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi thêm yêu cầu');
    }
  }
);

// Update Request
export const updateRequest = createAsyncThunk<
  ShippingRequestResponse,
  { request: Partial<ShippingRequest> },
  { rejectValue: string }
>(
  'requests/edit',
  async ({ request }, thunkAPI) => {
    try {
      const data = await requestAPI.updateRequest(request);
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi cập nhật yêu cầu');
    }
  }
);

export const listOfficeRequests = createAsyncThunk<
  ShippingRequestResponse,
  {
    officeId: number;
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
  'requests/by-office',
  async ({ officeId, page, limit, searchText, type, status, sort, startDate, endDate }, thunkAPI) => {
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

      const data = await requestAPI.listOfficeRequests(officeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách yêu cầu của bưu cục');
    }
  }
);

export const cancelRequest = createAsyncThunk(
  "requests/cancel",
  async (requestId: number, { rejectWithValue }) => {
    try {
      const response = await requestAPI.cancelRequest(requestId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data.message || "Hủy yêu cầu thất bại");
    }
  }
);

const shippingRequestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    clearShippingRequestError: (state) => {
      state.error = null;
    },
    setShippingRequest: (state, action: PayloadAction<ShippingRequest>) => {
      state.request = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Statused 
    builder
      .addCase(getRequestStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequestStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getRequestStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Types Enum
    builder
      .addCase(getRequestTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequestTypes.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.requestTypes) {
          state.requestTypes = action.payload.requestTypes;
        }
      })
      .addCase(getRequestTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(listUserRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listUserRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.requests = action.payload.requests || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listUserRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        const newRequest = action.payload.request;
        if (action.payload.success && newRequest) {
          state.requests = [newRequest, ...(state.requests || [])];
        }
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.request) {
          const index = state.requests.findIndex(emp => emp.id === action.payload.request?.id);
          if (index !== -1) {
            state.requests[index] = action.payload.request;
          }
          state.request = action.payload.request;
        }
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(cancelRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(listOfficeRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listOfficeRequests.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.requests = action.payload.requests || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(listOfficeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearShippingRequestError, setShippingRequest } = shippingRequestSlice.actions;
export default shippingRequestSlice.reducer;