export const translateOrderStatus = (status) => {
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