export interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
}

export interface PromotionResponse {
  success: boolean;
  message?: string; 
  promotion?: Promotion;
  promotions: Promotion[];  
  nextCursor?: number;
  total?: number,
  limit?: number,
}

export interface PromotionState {
  promotion: Promotion | null;
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  nextCursor?: number | null;
  total: number;
  limit: number;
}