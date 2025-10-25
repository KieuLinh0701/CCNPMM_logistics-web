import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderAPI } from '../services/api';
import { Order, OrderResponse, OrderState } from '../types/order';

const initialState: OrderState = {
  loading: false,
  error: null,
  order: null,
  orders: [],
  shippingFee: 0,
  total: 0,
  page: 1,
  limit: 10,
  statuses: [],
  paymentMethods: [],
  payers: [],
  paymentStatuses: [],
  paymentUrl: null,
};

// Tính phí vận chuyển
export const calculateShippingFee = createAsyncThunk(
  'order/calculateShippingFee',
  async (
    {
      weight,
      serviceTypeId,
      senderCodeCity,
      recipientCodeCity,
    }: {
      weight: number;
      serviceTypeId: number;
      senderCodeCity: number;
      recipientCodeCity: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // Gọi API với query params
      const response = await orderAPI.calculateShippingFee(
        weight,
        serviceTypeId,
        senderCodeCity,
        recipientCodeCity
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Tính phí vận chuyển thất bại'
      );
    }
  }
);

// Lấy Status Enum
export const getOrderStatuses = createAsyncThunk(
  'order/getStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái đơn hàng thất bại');
    }
  }
);

// Lấy Status Enum
export const getOrderPaymentMethods = createAsyncThunk(
  'order/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderPaymentMethods();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin phương thức thanh toán thất bại');
    }
  }
);

export const createUserOrder = createAsyncThunk(
  'order/createUserOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createUserOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createManagerOrder = createAsyncThunk(
  'order/createManagerOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.createManagerOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Check trạng thái thanh toán VNPay
export const checkVNPayPayment = createAsyncThunk<
  any,
  string,
  { rejectValue: any }
>(
  'order/checkVNPayPayment',
  async (query, { rejectWithValue }) => {
    try {
      const data = await orderAPI.checkVNPayPayment(query);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getUserOrders = createAsyncThunk<
  OrderResponse,
  {
    page: number,
    limit: number,
    searchText?: string;
    payer?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    cod?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'order/getUserOrders',
  async ({ page, limit, searchText, payer, status, paymentStatus, paymentMethod, cod, sort, startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (payer) params.append("payer", payer);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (cod) params.append("cod", cod);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await orderAPI.getUserOrders(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của cửa hàng');
    }
  }
);

// Lấy Payer Enum
export const getOrderPayers = createAsyncThunk(
  'order/getPayers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderPayers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin người thanh toán đơn hàng thất bại');
    }
  }
);

// Lấy Payment Status Enum
export const getOrderPaymentStatuses = createAsyncThunk(
  'order/getPaymentStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderAPI.getOrderPaymentStatuses();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin trạng thái thanh toán đơn hàng thất bại');
    }
  }
);

export const cancelUserOrder = createAsyncThunk(
  'order/cancelUserOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelUserOrder(orderId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data.message || "Hủy đơn hàng thất bại");
    }
  }
);

// Lấy thông tin 1 đơn hàng theo orderId
export const getOrderByTrackingNumber = createAsyncThunk<
  OrderResponse,
  string,
  { rejectValue: string }
>(
  'order/getByTrackingNumber',
  async (trackingNumber, { rejectWithValue }) => {
    try {
      const data = await orderAPI.getOrderByTrackingNumber(trackingNumber);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lấy thông tin đơn hàng thất bại');
    }
  }
);

export const getUserOrdersDashboard = createAsyncThunk<
  OrderResponse,
  {
    startDate?: string;
    endDate?: string;
  },
  { rejectValue: string }
>(
  'order/getUserOrdersDashboard',
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await orderAPI.getUserOrdersDashboard(params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của cửa hàng');
    }
  }
);

export const createVNPayURL = createAsyncThunk<
  OrderResponse,
  number,
  { rejectValue: any }
>(
  'order/createVNPayURL',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderAPI.createVNPayURL(orderId);
      return data as OrderResponse;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const updateUserOrder = createAsyncThunk(
  'order/updateUserOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateUserOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const setOrderToPending = createAsyncThunk(
  'order/setToPending',
  async (payload: { orderId: number }, { rejectWithValue }) => {
    try {
      const response = await orderAPI.setOrderToPending(payload.orderId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getOrdersByOfficeId = createAsyncThunk<
  OrderResponse,
  {
    officeId: number;
    page: number,
    limit: number,
    searchText?: string;
    payer?: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    cod?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
    senderWard?: number;
    recipientWard?: number;
  },
  { rejectValue: string }
>(
  'order/getByOfficeId',
  async ({ officeId, page, limit, searchText, payer, status, paymentStatus, paymentMethod, cod, startDate, endDate, senderWard, recipientWard, sort }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (payer) params.append("payer", payer);
      if (status) params.append("status", status);
      if (paymentStatus) params.append("paymentStatus", paymentStatus);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (cod) params.append("cod", cod);
      if (sort) params.append("sort", sort);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (senderWard) params.append("senderWard", senderWard.toString());
      if (recipientWard) params.append("recipientWard", recipientWard.toString());

      const data = await orderAPI.getOrdersByOfficeId(officeId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của bưu cục');
    }
  }
);

export const confirmAndAssignOrder = createAsyncThunk(
  'order/confirmAndAssign',
  async (
    { orderId, officeId }: { orderId: number; officeId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await orderAPI.confirmAndAssignOrder(orderId, officeId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Xác nhận đơn hàng thất bại'
      );
    }
  }
);

export const cancelManagerOrder = createAsyncThunk(
  'order/cancelManagerOrder',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await orderAPI.cancelManagerOrder(orderId);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data.message || "Hủy đơn hàng thất bại");
    }
  }
);

export const updateManagerOrder = createAsyncThunk(
  'order/updateManagerOrder',
  async (order: Order, { rejectWithValue }) => {
    try {
      const response = await orderAPI.updateManagerOrder(order);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getShipmentOrders = createAsyncThunk<
  OrderResponse,
  {
    shipmentId: number,
    page: number,
    limit: number,
    searchText?: string;
    payer?: string;
    paymentMethod?: string;
    cod?: string;
    sort?: string;
  },
  { rejectValue: string }
>(
  'order/getShipmentOrders',
  async ({ shipmentId, page, limit, searchText, payer, paymentMethod, cod, sort }, thunkAPI) => {
    try {
      // Build query param
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (searchText) params.append("search", searchText);
      if (payer) params.append("payer", payer);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);
      if (cod) params.append("cod", cod);
      if (sort) params.append("sort", sort);

      const data = await orderAPI.getShipmentOrders(shipmentId, params.toString());
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng của chuyến');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    setOrder: (state, action: PayloadAction<Order>) => {
      state.order = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Calculate Shipping Fee
    builder
      .addCase(calculateShippingFee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateShippingFee.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && typeof action.payload.shippingFee === 'number') {
          state.shippingFee = action.payload.shippingFee;
        }
      })
      .addCase(calculateShippingFee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Statuses
    builder
      .addCase(getOrderStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.statuses) {
          state.statuses = action.payload.statuses;
        }
      })
      .addCase(getOrderStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getOrderPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentMethods) {
          state.paymentMethods = action.payload.paymentMethods;
        }
      })
      .addCase(getOrderPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Order
    builder
      .addCase(createUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });


    // Create Order
    builder
      .addCase(createManagerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createManagerOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createManagerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Orders By User
    builder
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getUserOrdersDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrdersDashboard.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
        }
      })
      .addCase(getUserOrdersDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Payers
    builder
      .addCase(getOrderPayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderPayers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.payers) {
          state.payers = action.payload.payers;
        }
      })
      .addCase(getOrderPayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Payment Statuses
    builder
      .addCase(getOrderPaymentStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderPaymentStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentStatuses) {
          state.paymentStatuses = action.payload.paymentStatuses;
        }
      })
      .addCase(getOrderPaymentStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelUserOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Order By Id
    builder
      .addCase(getOrderByTrackingNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByTrackingNumber.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.order = action.payload.order || null;
        }
      })
      .addCase(getOrderByTrackingNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create VNPay Url
    builder
      .addCase(createVNPayURL.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVNPayURL.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.paymentUrl) {
          state.paymentUrl = action.payload.paymentUrl;
        }
      })
      .addCase(createVNPayURL.rejected, (state, action) => {
        state.loading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.payload as any)?.message || "Tạo URL thanh toán VNPay thất bại";
      });

    builder
      .addCase(checkVNPayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkVNPayPayment.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkVNPayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Error";
      });

    // Update Order
    builder
      .addCase(updateUserOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order Status To Pending
    builder
      .addCase(setOrderToPending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setOrderToPending.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setOrderToPending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Orders By Office
    builder
      .addCase(getOrdersByOfficeId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByOfficeId.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getOrdersByOfficeId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(confirmAndAssignOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAndAssignOrder.fulfilled, (state, action) => {
        state.loading = false;

        // Cập nhật order trong danh sách orders
        if (action.payload.success && action.payload.order) {
          const updatedOrder = action.payload.order;

          // Cập nhật trong mảng orders
          const orderIndex = state.orders.findIndex(order => order.id === updatedOrder.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex] = {
              ...state.orders[orderIndex],
              ...updatedOrder,
              status: 'confirmed',
              toOffice: updatedOrder.toOffice,
            };
          }

          // Cập nhật order detail nếu đang xem chi tiết
          if (state.order && state.order.id === updatedOrder.id) {
            state.order = {
              ...state.order,
              ...updatedOrder,
              status: 'confirmed',
              toOffice: updatedOrder.toOffice
            };
          }
        }
      })
      .addCase(confirmAndAssignOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelManagerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelManagerOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(cancelManagerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Order
    builder
      .addCase(updateManagerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateManagerOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateManagerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getShipmentOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipmentOrders.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.orders = action.payload.orders || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.limit = action.payload.limit || 10;
        }
      })
      .addCase(getShipmentOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOrderError, setOrder } = orderSlice.actions;
export default orderSlice.reducer;