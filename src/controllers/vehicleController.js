import vehicleService from "../services/vehicleService.js";

const vehicleController = {

  // --- MANAGER / OFFICE SIDE ---
  // Get Types Enum
  async getTypesEnum(req, res) {
    try {
      const userId = req.user.id;
      const result = await vehicleService.getTypesEnum(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get Types Enum error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Get Statuses Enum
  async getStatusesEnum(req, res) {
    try {
      const userId = req.user.id;
      const result = await vehicleService.getStatusesEnum(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Get Statuses Enum error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Get Vehicles By Office
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

      const result = await vehicleService.getVehiclesByOffice(
        userId,
        officeId,
        page,
        limit,
        filters
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get Vehicles By Office error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Add Vehicle
  async addVehicle(req, res) {
    try {
      const userId = req.user.id;
      const officeId = parseInt(req.params.officeId);
      const { licensePlate, type, capacity, description } = req.body;

      const result = await vehicleService.addVehicle(
        userId,
        officeId,
        licensePlate,
        type,
        capacity,
        description
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Add Vehicle error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Update Vehicle
  async updateVehicle(req, res) {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const { licensePlate, type, capacity, status, description } = req.body;

      console.log("capacity", capacity);

      const result = await vehicleService.updateUserVehicle(
        userId,
        id,
        licensePlate,
        type,
        capacity,
        status,
        description
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Update Vehicle error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Import Vehicles
  async importVehicles(req, res) {
    try {
      const userId = req.user.id;
      const officeId = parseInt(req.params.id);
      const { vehicles } = req.body;

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Không có dữ liệu phương tiện để import" });
      }

      const result = await vehicleService.importVehicles(userId, officeId, vehicles);

      if (result.success) return res.status(200).json(result);
      return res.status(400).json(result);
    } catch (error) {
      console.error("Import Vehicles error:", error);
      return res.status(500).json({ success: false, message: "Lỗi server khi import phương tiện" });
    }
  },

  // --- ADMIN SIDE ---

  async list(req, res) {
    try {
      const { page, limit, search, type, status } = req.query;
      const result = await vehicleService.listVehicles({ page, limit, search, type, status });
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getById(req, res) {
    try {
      const result = await vehicleService.getVehicleById(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await vehicleService.createVehicle(req.body);
      if (!result.success) {
        const statusCode = result.message.includes("đã tồn tại") ? 409 : 400;
        return res.status(statusCode).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await vehicleService.updateVehicle(req.params.id, req.body);
      if (!result.success) {
        const statusCode = result.message.includes("đã tồn tại") ? 409 : 404;
        return res.status(statusCode).json(result);
      }
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async remove(req, res) {
    try {
      const result = await vehicleService.deleteVehicle(req.params.id);
      if (!result.success) return res.status(404).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStats(req, res) {
    try {
      const result = await vehicleService.getVehicleStats();
      if (!result.success) return res.status(400).json(result);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default vehicleController;