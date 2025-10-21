import api from './api';

export interface ShipperStats {
  totalAssigned: number;
  inProgress: number;
  delivered: number;
  failed: number;
  codCollected: number;
}

export interface ShipperOrder {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  shippingFee: number;
  discountAmount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  priority: 'normal' | 'urgent';
  serviceType: string;
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
  proofImages?: string[];
  actualRecipient?: string;
  actualRecipientPhone?: string;
  codCollected?: number;
}

export interface ShipperRoute {
  routeInfo: {
    id: number;
    name: string;
    startLocation: string;
    totalStops: number;
    completedStops: number;
    totalDistance: number;
    estimatedDuration: number;
    totalCOD: number;
    status: 'not_started' | 'in_progress' | 'completed';
  };
  deliveryStops: Array<{
    id: number;
    trackingNumber: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
    priority: 'normal' | 'urgent';
    serviceType: string;
    estimatedTime: string;
    status: 'pending' | 'in_progress' | 'completed';
    coordinates: {
      lat: number;
      lng: number;
    };
    distance: number;
    travelTime: number;
  }>;
}

export interface ShipperCODTransaction {
  id: number;
  trackingNumber: string;
  recipientName: string;
  recipientPhone: string;
  codAmount: number;
  status: 'pending' | 'collected' | 'submitted';
  collectedAt?: string;
  submittedAt?: string;
  notes?: string;
}

export interface ShipperNotification {
  id: number;
  type: 'urgent' | 'route_change' | 'new_order' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface ShipperIncident {
  id: number;
  trackingNumber: string;
  incidentType: string;
  title: string;
  description: string;
  location: string;
  priority: 'low' | 'medium' | 'high';
  recipientName: string;
  recipientPhone: string;
  images: string[];
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
}

const shipperService = {
  // Dashboard
  async getDashboard(): Promise<{
    stats: ShipperStats;
    todayOrders: ShipperOrder[];
    notifications: ShipperNotification[];
  }> {
    const response = await api.get('/shipper/dashboard');
    return (response.data as any).data;
  },

  // Orders
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    route?: string;
  } = {}): Promise<{
    orders: ShipperOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    console.log('[shipperService.getOrders] params', params);
    const response = await api.get('/shipper/orders', { params });
    const raw = (response.data as any);
    const data = raw?.data ?? raw; // tolerate either {success,data} or direct data
    const ordersRaw = data?.orders ?? data?.data ?? [];
    const orders = (Array.isArray(ordersRaw) ? ordersRaw : []).map((o: any) => ({
      ...o,
      codAmount: o?.cod || 0,
      shippingFee: o?.shippingFee || 0,
      discountAmount: o?.discountAmount || 0,
      paymentMethod: o?.paymentMethod || 'Cash',
      serviceType: typeof o?.serviceType === 'object' && o?.serviceType !== null
        ? (o.serviceType.name ?? '')
        : (o?.serviceType ?? ''),
      recipientAddress: (o?.recipientAddress || o?.recipientDetailAddress || '').replace(/,\s*\d+,\s*\d+$/, ''),
    }));
    const pagination = data?.pagination ?? data?.meta ?? { page: params.page ?? 1, limit: params.limit ?? 10, total: orders.length };
    console.log('[shipperService.getOrders] parsed', { count: orders.length, pagination });
    return { orders, pagination };
  },

  async getUnassignedOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{
    orders: ShipperOrder[];
    pagination: { page: number; limit: number; total: number };
  }> {
    console.log('[shipperService.getUnassignedOrders] params', params);
    const response = await api.get('/shipper/orders-unassigned', { params });
    const raw = (response.data as any);
    const data = raw?.data ?? raw;
    const ordersRaw = data?.orders ?? data?.data ?? [];
    const orders = (Array.isArray(ordersRaw) ? ordersRaw : []).map((o: any) => ({
      ...o,
      codAmount: o?.cod || 0,
      shippingFee: o?.shippingFee || 0,
      discountAmount: o?.discountAmount || 0,
      paymentMethod: o?.paymentMethod || 'Cash',
      serviceType: typeof o?.serviceType === 'object' && o?.serviceType !== null
        ? (o.serviceType.name ?? '')
        : (o?.serviceType ?? ''),
      recipientAddress: (o?.recipientAddress || o?.recipientDetailAddress || '').replace(/,\s*\d+,\s*\d+$/, ''),
    }));
    const pagination = data?.pagination ?? data?.meta ?? { page: params.page ?? 1, limit: params.limit ?? 10, total: orders.length };
    const result = { orders, pagination };
    console.log('[shipperService.getUnassignedOrders] parsed', { count: orders.length, pagination });
    return result;
  },

  async claimOrder(orderId: number): Promise<void> {
    console.log('[shipperService.claimOrder] orderId', orderId);
    await api.post(`/shipper/orders/${orderId}/claim`);
  },

  async unclaimOrder(orderId: number): Promise<void> {
    console.log('[shipperService.unclaimOrder] orderId', orderId);
    await api.post(`/shipper/orders/${orderId}/unclaim`);
  },

  async getOrderDetail(id: number): Promise<ShipperOrder> {
    console.log('[shipperService.getOrderDetail] request', { id });
    const response = await api.get(`/shipper/orders/${id}`);
    console.log('[shipperService.getOrderDetail] raw response', response);
    const raw = (response.data as any);
    const data = raw?.data ?? raw;
    const normalized = {
      ...data,
      codAmount: data?.cod || 0,
      shippingFee: data?.shippingFee || 0,
      discountAmount: data?.discountAmount || 0,
      paymentMethod: data?.paymentMethod || 'Cash',
      serviceType: typeof data?.serviceType === 'object' && data?.serviceType !== null
        ? (data.serviceType.name ?? '')
        : (data?.serviceType ?? ''),
      recipientAddress: typeof data?.recipientAddress === 'string'
        ? data.recipientAddress.replace(/,\s*\d+,\s*\d+$/, '')
        : [data?.recipientDetailAddress].filter(Boolean).join(', ').replace(/,\s*\d+,\s*\d+$/, '')
    };
    console.log('[shipperService.getOrderDetail] normalized data', normalized);
    return normalized as ShipperOrder;
  },

  async updateDeliveryStatus(id: number, data: {
    status: string;
    notes?: string;
    proofImages?: string[];
    actualRecipient?: string;
    actualRecipientPhone?: string;
    codCollected?: number;
    totalAmountCollected?: number;
    shipperId?: number;
  }): Promise<void> {
    await api.put(`/shipper/orders/${id}/status`, data);
  },

  // History
  async getDeliveryHistory(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    route?: string;
  } = {}): Promise<{
    orders: ShipperOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    stats: ShipperStats;
  }> {
    console.log('[shipperService.getDeliveryHistory] params', params);
    const response = await api.get('/shipper/history', { params });
    console.log('[shipperService.getDeliveryHistory] raw response', response);
    const raw = (response.data as any);
    console.log('[shipperService.getDeliveryHistory] parsed data', raw);
    
    // API trả về { success: true, data: Array(10), pagination: {...}, stats: {...} }
    // Cần lấy raw.data cho orders, raw.pagination cho pagination, raw.stats cho stats
    const orders = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.orders)
      ? raw.orders
      : [];
    console.log('[shipperService.getDeliveryHistory] orders', orders);
    
    const pagination = raw?.pagination ?? raw?.meta ?? { page: params.page ?? 1, limit: params.limit ?? 10, total: orders.length };
    const statsRaw = raw?.stats ?? {};
    const stats = {
      totalAssigned: Number((statsRaw as any).totalAssigned) || 0,
      inProgress: Number((statsRaw as any).inProgress) || 0,
      delivered: Number((statsRaw as any).delivered) || 0,
      failed: Number((statsRaw as any).failed) || 0,
      codCollected: Number((statsRaw as any).codCollected) || 0
    } as ShipperStats;
    
    console.log('[shipperService.getDeliveryHistory] final result', { orders: orders.length, pagination, stats });
    return { orders, pagination, stats };
  },

  // Route
  async getDeliveryRoute(): Promise<ShipperRoute> {
    const response = await api.get('/shipper/route');
    const data = response.data as { success: boolean; data?: ShipperRoute; message?: string };
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.message || 'Lỗi khi tải dữ liệu lộ trình');
  },

  async startRoute(routeId: number): Promise<void> {
    await api.post('/shipper/route/start', { routeId });
  },

  // COD Management
  async getCODTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<{
    transactions: ShipperCODTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
    summary: {
      totalCollected: number;
      totalSubmitted: number;
      totalPending: number;
      transactionCount: number;
    };
  }> {
    console.log('[shipperService.getCODTransactions] params:', params);
    const response = await api.get('/shipper/cod', { params });
    console.log('[shipperService.getCODTransactions] raw response:', response);
    const raw = (response.data as any);
    console.log('[shipperService.getCODTransactions] raw data:', raw);
    
    // API response structure: { success: true, data: [...], pagination: {...}, summary: {...} }
    const rawTransactions = Array.isArray(raw?.data) ? raw.data : [];
    console.log('[shipperService.getCODTransactions] raw transactions:', rawTransactions);
    
    // Map backend format to frontend format
    const transactions: ShipperCODTransaction[] = rawTransactions.map((order: any) => ({
      id: order.id,
      trackingNumber: order.trackingNumber,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      codAmount: order.cod || 0,
      status: order.status === 'delivered' ? 'collected' : 'pending',
      collectedAt: order.deliveredAt,
      submittedAt: order.deliveredAt,
      notes: order.notes
    }));
    console.log('[shipperService.getCODTransactions] mapped transactions:', transactions);
    
    const pagination = raw?.pagination ?? { page: params.page ?? 1, limit: params.limit ?? 10, total: transactions.length };
    console.log('[shipperService.getCODTransactions] pagination:', pagination);
    
    const summaryRaw = raw?.summary ?? {};
    console.log('[shipperService.getCODTransactions] summaryRaw:', summaryRaw);
    
    const summary = {
      totalCollected: Number((summaryRaw as any).totalCollected) || 0,
      totalSubmitted: Number((summaryRaw as any).totalSubmitted) || 0,
      totalPending: Number((summaryRaw as any).totalPending) || 0,
      transactionCount: Number((summaryRaw as any).transactionCount) || transactions.length
    };
    console.log('[shipperService.getCODTransactions] final summary:', summary);
    
    return { transactions, pagination, summary };
  },

  async submitCOD(data: {
    transactionIds: number[];
    totalAmount: number;
    notes?: string;
  }): Promise<void> {
    await api.post('/shipper/cod/submit', data);
  },

  // Incident Report
  async reportIncident(data: {
    trackingNumber: string;
    incidentType: string;
    title: string;
    description: string;
    location: string;
    priority: 'low' | 'medium' | 'high';
    recipientName: string;
    recipientPhone: string;
    images: string[];
  }): Promise<void> {
    await api.post('/shipper/incident', data);
  }
};

export default shipperService;
