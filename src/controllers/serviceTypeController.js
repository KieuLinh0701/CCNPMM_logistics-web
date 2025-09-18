import serviceTypeService from "../services/serviceTypeService";

const serviceTypeController = {
  // Get Type Service Active
  async getActiveServiceTypes(req, res) {
    try {

      const result = await serviceTypeService.getActiveServiceTypes();

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Type Service Active error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};

export default serviceTypeController;
