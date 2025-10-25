export const translateTransactionType = (type: string): string => {
  switch (type) {
    case 'Income': return 'Thu vào';
    case 'Expense': return 'Chi ra';
    default: return type;
  }
};

export const translateTransactionPurpose = (purpose: string): string => {
  switch (purpose) {
    case 'Refund': return 'Hoàn tiền phí vận chuyển';          
    case 'CODReturn': return 'Thanh toán COD';           
    case 'ShippingService': return 'Thanh toán phí vận chuyển'; 
    case 'OfficeExpense': return 'Chi phí vận hành văn phòng';  
    case 'RevenueTransfer': return 'Chuyển doanh thu lên tổng'; 
    default: return purpose;
  }
};

export const translateTransactionMethod = (method: string): string => {
  switch (method) {
    case 'Cash': return 'Tiền mặt';          
    case 'VNPay': return 'VNPay';        
    default: return method;
  }
};

export const translateTransactionStatus = (status: string): string => {
  switch (status) {
    case 'Pending': return 'Chờ xác nhận';          
    case 'Confirmed': return 'Đã xác nhận';    
    case 'Rejected': return 'Bị từ chối';            
    default: return status;
  }
};