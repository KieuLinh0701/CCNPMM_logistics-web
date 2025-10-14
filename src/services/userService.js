import db from '../models/index.js';
import bcrypt from 'bcryptjs';

// Sanitize user data (remove password and sensitive fields)
const sanitizeUser = (userInstance) => {
  if (!userInstance) return null;
  const { 
    id, email, firstName, lastName, phoneNumber, role, isVerified, isActive, 
    detailAddress, codeWard, codeCity, lastLoginAt, createdAt, updatedAt 
  } = userInstance;
  return { 
    id, email, firstName, lastName, phoneNumber, role, isVerified, isActive,
    detailAddress, codeWard, codeCity, lastLoginAt, createdAt, updatedAt 
  };
};

// List users with pagination and search
const listUsers = async (params) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const offset = (Number(page) - 1) * Number(limit);
      const where = {};
      
      if (search) {
        where[db.Sequelize.Op.or] = [
          { email: { [db.Sequelize.Op.like]: `%${search}%` } },
          { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { phoneNumber: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }
      
      const { rows, count } = await db.User.findAndCountAll({ 
        where, 
        limit: Number(limit), 
        offset, 
        order: [["createdAt", "DESC"]] 
      });
      
      resolve({
        success: true,
        data: rows.map(sanitizeUser),
        pagination: { page: Number(page), limit: Number(limit), total: count }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Get user by ID
const getUserById = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(userId);
      if (!user) {
        resolve({ success: false, message: "Không tìm thấy người dùng" });
        return;
      }
      resolve({ success: true, data: sanitizeUser(user) });
    } catch (error) {
      reject(error);
    }
  });
};

// Create new user
const createUser = async (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { 
        email, password, firstName, lastName, phoneNumber, role = "user", isActive = true,
        detailAddress, codeWard, codeCity
      } = userData;
      
      if (!email || !password || !firstName || !lastName || !phoneNumber) {
        resolve({ success: false, message: "Thiếu thông tin bắt buộc" });
        return;
      }
      
      // Check if user already exists
      const exists = await db.User.findOne({ where: { email } });
      if (exists) {
        resolve({ success: false, message: "Email đã tồn tại" });
        return;
      }
      
      // Hash password
      const hashed = await bcrypt.hash(password, 10);
      
      // Create user
      const created = await db.User.create({ 
        email, 
        password: hashed, 
        firstName, 
        lastName, 
        phoneNumber, 
        role, 
        isActive,
        detailAddress,
        codeWard,
        codeCity
      });
      
      resolve({ success: true, data: sanitizeUser(created) });
    } catch (error) {
      reject(error);
    }
  });
};

// Update user
const updateUser = async (userId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { 
        firstName, lastName, phoneNumber, role, isActive, password,
        detailAddress, codeWard, codeCity
      } = updateData;
      
      const user = await db.User.findByPk(userId);
      if (!user) {
        resolve({ success: false, message: "Không tìm thấy người dùng" });
        return;
      }
      
      // Update fields
      if (typeof firstName !== "undefined") user.firstName = firstName;
      if (typeof lastName !== "undefined") user.lastName = lastName;
      if (typeof phoneNumber !== "undefined") user.phoneNumber = phoneNumber;
      if (typeof role !== "undefined") user.role = role;
      if (typeof isActive !== "undefined") user.isActive = isActive;
      if (typeof detailAddress !== "undefined") user.detailAddress = detailAddress;
      if (typeof codeWard !== "undefined") user.codeWard = codeWard;
      if (typeof codeCity !== "undefined") user.codeCity = codeCity;
      
      // Update password if provided
      if (typeof password === "string" && password.length > 0) {
        user.password = await bcrypt.hash(password, 10);
      }
      
      await user.save();
      resolve({ success: true, data: sanitizeUser(user) });
    } catch (error) {
      reject(error);
    }
  });
};

// Delete user
const deleteUser = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(userId);
      if (!user) {
        resolve({ success: false, message: "Không tìm thấy người dùng" });
        return;
      }
      
      await user.destroy();
      resolve({ success: true });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

