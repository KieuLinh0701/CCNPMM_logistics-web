import db from '../models';

const orderService = {
  // CalculateShippingFee
  async calculateShippingFee({ weight, serviceTypeId, senderCodeCity, recipientCodeCity }) {
    try {
      // 1. Lấy vùng của người gửi & người nhận
      const senderRegion = await db.Region.findOne({
        where: { codeCity: Number(senderCodeCity) },
      });
      const recipientRegion = await db.Region.findOne({
        where: { codeCity: Number(recipientCodeCity) },
      });

      if (!senderRegion || !recipientRegion) {
        return {
          success: false,
          message: "Không tìm thấy thông tin vùng của người gửi hoặc người nhận",
        };
      }

      // 2. Xác định regionType
      let regionType = "";
      if (senderCodeCity === recipientCodeCity) {
        regionType = "Intra-city";
      } else if (senderRegion.regionName === recipientRegion.regionName) {
        regionType = "Intra-region";
      } else if (
        (senderRegion.regionName === "North" && recipientRegion.regionName === "Central") ||
        (senderRegion.regionName === "Central" && recipientRegion.regionName === "North") ||
        (senderRegion.regionName === "Central" && recipientRegion.regionName === "South") ||
        (senderRegion.regionName === "South" && recipientRegion.regionName === "Central")
      ) {
        regionType = "Near-region";
      } else {
        regionType = "Inter-region"; // Bắc - Nam
      }

      // 3. Lấy danh sách ShippingRate phù hợp
      const shippingRates = await db.ShippingRate.findAll({
        where: {
          serviceTypeId,
          regionType,
        },
        order: [["weightFrom", "ASC"]],
      });

      if (!shippingRates || shippingRates.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy bảng giá cho loại dịch vụ này",
        };
      }

      // 4. Chọn mức giá
      let selectedRate = null;
      for (const rate of shippingRates) {
        if (rate.weightTo) {
          if (weight > rate.weightFrom && weight <= rate.weightTo) {
            selectedRate = rate;
            break;
          }
        } else {
          if (weight > rate.weightFrom) {
            selectedRate = rate;
            break;
          }
        }
      }

      if (!selectedRate) {
        return {
          success: false,
          message: "Không tìm thấy mức giá phù hợp cho cân nặng",
        };
      }

      let shippingFee = Number(selectedRate.price);

      // Nếu weightTo = null => cộng thêm extraPrice
      if (!selectedRate.weightTo && selectedRate.extraPrice) {
        const extraWeight = weight - Number(selectedRate.weightFrom);
        const step = Number(selectedRate.unit) || 0.5;
        const extraSteps = Math.ceil(extraWeight / step);
        shippingFee += extraSteps * Number(selectedRate.extraPrice);
      }

      return {
        success: true,
        message: "Tính phí vận chuyển thành công",
        shippingFee,
      };
    } catch (error) {
      console.error("Calculate Shipping Fee error:", error);
      return {
        success: false,
        message: "Lỗi server khi tính phí vận chuyển",
      };
    }
  },
};

export default orderService;