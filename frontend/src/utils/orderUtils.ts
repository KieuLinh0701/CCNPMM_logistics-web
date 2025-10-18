// Hàm dịch trạng thái đơn hàng
export const translateOrderStatus = (status: string): string => {
  switch (status) {
    case 'draft': return 'Bản nháp';
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'picked_up': return 'Đã lấy hàng';
    case 'in_transit': return 'Đang vận chuyển';
    case 'delivering': return 'Đang giao hàng';
    case 'delivered': return 'Đã giao hàng';
    case 'cancelled': return 'Đã hủy';
    case 'returning': return 'Đang hoàn';
    case 'returned': return 'Đã hoàn';
    default: return status;
  }
};

export const translateOrderPaymentStatus = (status: string): string => {
  switch (status) {
    case 'Paid': return 'Đã thanh toán';
    case 'Unpaid': return 'Chưa thanh toán';
    case 'Refunded': return 'Đã hoàn tiền';
    default: return status;
  }
};

export const translateOrderPaymentMethod = (method: string): string => {
  switch (method) {
    case 'Cash': return 'Tiền mặt';
    case 'BankTransfer': return 'Chuyển khoản ngân hàng';
    default: return method;
  }
};

export const translateOrderPayer = (payer: string): string => {
  switch (payer) {
    case 'Shop': return 'Người gửi';
    case 'Customer': return 'Người nhận';
    default: return payer;
  }
};

// Hàm lấy tên xã/phường
export const getWardName = (wardCode: string | number, wards: { code: number; name: string }[] = []) =>
  wards.find(w => w.code === Number(wardCode))?.name || '';