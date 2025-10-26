import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { incidentAPI } from '../services/api';
import { IncidentReportResponse, IncidentReportState } from '../types/incidentReport';

const initialState: IncidentReportState = {
  incidents: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  statuses: [],
  types: [],
  totalByStatus: [],
};

export const getIncidentTypes = createAsyncThunk(
  'incident/getTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await incidentAPI.getIncidentTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Lấy danh sách loại sự cố thất bại'
      );
    }
  }
);

// Lấy danh sách trạng thái sự cố
export const getIncidentStatuses = createAsyncThunk(
  'incident/getStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await incidentAPI.getIncidentStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Lấy danh sách trạng thái sự cố thất bại'
      );
    }
  }
);

// Lấy danh sách báo cáo sự cố của bưu cục
export const listOfficeIncidents = createAsyncThunk<
  IncidentReportResponse,
  { page: number; limit: number; status?: string; type?: string; sort?: string; searchText?: string; startDate?: string; endDate?: string },
  { rejectValue: string }
>(
  'incident/listOfficeIncidents',
  async ({ page, limit, status, startDate, endDate, type, searchText, sort }, thunkAPI) => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (status) params.append('status', status);
      if (type) params.append('status', type);
      if (sort) params.append('sort', sort);
      if (searchText) params.append('search', searchText);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const data = await incidentAPI.listOfficeIncidents(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách báo cáo sự cố');
    }
  }
);

// Manager xử lý một báo cáo
export const handleIncident = createAsyncThunk<
  IncidentReportResponse,
  { incidentId: number; status?: string; resolution?: string },
  { rejectValue: string }
>(
  'incident/handleIncident',
  async ({ incidentId, status, resolution }, thunkAPI) => {
    try {
      const data = await incidentAPI.handleIncident(incidentId, { status, resolution });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi xử lý báo cáo sự cố');
    }
  }
);

const incidentSlice = createSlice({
  name: 'incident',
  initialState,
  reducers: {
    clearIncidentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(getIncidentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncidentTypes.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.types) {
          state.types = action.payload.types;
        }
      })
      .addCase(getIncidentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // --- Incident Statuses ---
    builder
      .addCase(getIncidentStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getIncidentStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getIncidentStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // listOfficeIncidents
    builder
      .addCase(listOfficeIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listOfficeIncidents.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.incidents) {
          state.incidents = action.payload.incidents;
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
          state.totalByStatus = action.payload.totalByStatus || [];
        }
      })
      .addCase(listOfficeIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // handleIncident
    builder
      .addCase(handleIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleIncident.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.incidents) {
          // Cập nhật lại report trong danh sách nếu đã có
          const updatedIncident = action.payload.incidents[0];
          const index = state.incidents.findIndex(i => i.id === updatedIncident.id);
          if (index >= 0) {
            state.incidents[index] = updatedIncident;
          } else {
            state.incidents.unshift(updatedIncident);
          }
        }
      })
      .addCase(handleIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearIncidentError } = incidentSlice.actions;
export default incidentSlice.reducer;