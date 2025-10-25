export const translatePaymentSubmissionStatus = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'Chờ xác nhận';
    case 'Confirmed':
      return 'Đã thu';
    case 'Adjusted':
      return 'Đã điều chỉnh';
    case 'Rejected':
      return 'Từ chối';
    default:
      return status;
  }
};