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
    case 'CODReturn': return 'Trả tiền COD';           
    case 'ShippingService': return 'Thanh toán phí vận chuyển'; 
    case 'OfficeExpense': return 'Chi phí vận hành văn phòng';  
    case 'RevenueTransfer': return 'Chuyển doanh thu lên tổng'; 
    default: return purpose;
  }
};