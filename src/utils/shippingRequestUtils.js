export const translateShippingRequestStatus = (status) => {
  switch (status) {
    case "Pending":
      return "Đang chờ xử lý";
    case "Processing":
      return "Đang xử lý";
    case "Resolved":
      return "Đã giải quyết";
    case "Rejected":
      return "Bị từ chối";
    case "Cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const translateShippingRequestType = (type) => {
  switch (type) {
    case 'Complaint':
      return 'Khiếu nại';
    case 'DeliveryReminder':
      return 'Hối giao hàng';
    case 'ChangeOrderInfo':
      return 'Thay đổi thông tin đơn hàng';
    case 'Inquiry':
      return 'Thắc mắc';
    case 'PickupReminder':
      return 'Hối lấy hàng';
    default:
      return 'Không xác định';
  }
};