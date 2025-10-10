import productService from "../services/productService";
import vehicleService from "../services/vehicleService";

const vehicleController = {
  // Get Types Enum
  async getTypesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await vehicleService.getTypesEnum(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Types Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Get Statuses Enum
  async getStatusesEnum(req, res) {
    try {

      const userId = req.user.id;

      const result = await vehicleService.getStatusesEnum(userId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Statuses Enum error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Get By User
  async getVehiclesByOffice(req, res) {
    try {
      const userId = req.user.id;

      const officeId = parseInt(req.params.officeId);

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const filters = {
        searchText: req.query.search || undefined,
        type: req.query.type || undefined,
        status: req.query.status || undefined,
        sort: req.query.sort || undefined,
        startDate: req.query.startDate || undefined,
        endDate: req.query.endDate || undefined,
      };

      const result = await vehicleService.getVehiclesByOffice(userId, officeId, page, limit, filters);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Get Vehicles By error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Add Vehicle 
  async addVehicle(req, res) {
    try {
      const userId = req.user.id;

      const officeId = parseInt(req.params.officeId);

      const { licensePlate, type, capacity, description } = req.body;

      const result = await vehicleService.addVehicle(userId, officeId, licensePlate, type, capacity, description);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Product error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Update Vehicle 
  async updateVehicle(req, res) {
    try {
      const userId = req.user.id;

      const id = parseInt(req.params.id);

      const { licensePlate, type, capacity, status, description } = req.body;

      const result = await vehicleService.updateVehicle(userId, id, licensePlate, type, capacity, status, description);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update Vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server'
      });
    }
  },

  // Import Vehicles
  async importVehicles(req, res) {
    try {
      const userId = req.user.id;

      const id = parseInt(req.params.id);

      const { vehicles } = req.body;

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có dữ liệu phương tiện để import",
        });
      }

      const result = await vehicleService.importVehicles(userId, id, vehicles);

      console.log("result", result);

      if (result.success) {
        return res.status(200).json(result); 
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Import Vehicles error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server khi import phương tiện",
      });
    }
  },
};

export default vehicleController;
