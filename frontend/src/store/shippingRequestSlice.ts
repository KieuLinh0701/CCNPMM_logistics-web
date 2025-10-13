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

export const getTypesEnum = createAsyncThunk(
  'requests/get-types',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestAPI.getTypesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy loại yêu cầu thất bại');
    }
  }
);

export const getStatusesEnum = createAsyncThunk(
  'requests/get-statuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestAPI.getStatusesEnum();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy trạng thái yêu cầu thất bại');
    }
  }
);

export const getRequestsByUser = createAsyncThunk<
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

      const data = await requestAPI.getRequestsByUser(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách yêu cầu của cửa hàng');
    }
  }
);

// Add Request
export const addRequest = createAsyncThunk<
  ShippingRequestResponse,
  Partial<ShippingRequest>,
  { rejectValue: string }
>(
  'requests/add',
  async (request, thunkAPI) => {
    try {
      const data = await requestAPI.addRequest(request);
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

export const getRequestsByOffice = createAsyncThunk<
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

      const data = await requestAPI.getRequestsByOffice(officeId, params.toString());
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
      .addCase(getStatusesEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStatusesEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getStatusesEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Types Enum
    builder
      .addCase(getTypesEnum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTypesEnum.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.requestTypes) {
          state.requestTypes = action.payload.requestTypes;
        }
      })
      .addCase(getTypesEnum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getRequestsByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequestsByUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.requests = action.payload.requests || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getRequestsByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(addRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRequest.fulfilled, (state, action) => {
        state.loading = false;
        const newRequest = action.payload.request;
        if (action.payload.success && newRequest) {
          state.requests = [newRequest, ...(state.requests || [])];
        }
      })
      .addCase(addRequest.rejected, (state, action) => {
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
      .addCase(getRequestsByOffice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRequestsByOffice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.requests = action.payload.requests || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getRequestsByOffice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearShippingRequestError, setShippingRequest } = shippingRequestSlice.actions;
export default shippingRequestSlice.reducer;