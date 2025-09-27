export interface promotion {
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
  promotion?: promotion;  
}

export interface PromotionState {
  promotion: promotion | null;
  loading: boolean;
  error: string | null;
}