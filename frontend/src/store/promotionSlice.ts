import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { promotionAPI } from '../services/api';
import {Promotion, PromotionResponse, PromotionState } from '../types/promotion';

const initialState: PromotionState = {
  promotion:  null,
  promotions: [],
  loading: false,
  error: null,
  nextCursor: null,
  total: 0,
  limit: 10,
};

export const getActivePromotions = createAsyncThunk<
  PromotionResponse,
  {
    limit: number,
    searchText?: string;
    lastId?: number;
    shippingFee?: number;
  },
  { rejectValue: string }
>(
  'promotions/get-active',
  async ({ limit, searchText, lastId, shippingFee }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (lastId) params.append("lastId", String(lastId));
      if (shippingFee) params.append("shippingFee", String(shippingFee));

      const data = await promotionAPI.getActivePromotions(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách các khuyến mãi');
    }
  }
);

const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {
    clearPromotionError: (state) => {
      state.error = null;
    },
    setPromotion: (state, action: PayloadAction<Promotion>) => {
      state.promotion = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Active Promotions
    builder
      .addCase(getActivePromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivePromotions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          if (action.meta.arg.lastId) {
            state.promotions = [...state.promotions, ...(action.payload.promotions || [])];
          } else {
            state.promotions = action.payload.promotions || [];
          }
          state.total = action.payload.total || 0;
          state.limit = action.payload.limit || 10;
          state.nextCursor = action.payload.nextCursor || null;
        }
      })
      .addCase(getActivePromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPromotionError, setPromotion } = promotionSlice.actions;
export default promotionSlice.reducer;