import officeService from '../services/officeService.js';

const officeController = {
  // Get Office By User Id
  async getOfficeByUser(req, res) {
    try {
      const userId = req.user.id;

      const result = await officeService.getByUserId(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Office By UserId error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Update Office
  async update(req, res) {
    try {
      const userId = req.user.id;
      const officeId = req.params.id;
      const updateData = req.body;

      if (!officeId) return res.status(400).json({ success: false, message: 'Office id không được để trống' });

      const result = await officeService.update(userId, officeId, updateData);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Update office error:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  },

  // Get Offices by Area
  async getOfficesByArea(req, res) {
    try {
      const { codeCity, codeWard } = req.query;

      // Chuyển về number nếu có
      const city = codeCity ? Number(codeCity) : undefined;
      const ward = codeWard ? Number(codeWard) : undefined;

      const result = await officeService.getOfficesByArea(city, ward);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get Offices By Area error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },
};

export default officeController;
