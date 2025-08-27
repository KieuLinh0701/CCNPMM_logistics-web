import dotenv from 'dotenv';
dotenv.config();  // <--- load ngay khi module này được import

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import db from '../models/index.js';

const salt = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => {
  return speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: 6,
    step: 300 // 5 minutes
  });
};

// Send OTP via email
const sendOTPEmail = async (email, otp, type) => {
  const subject = type === 'register' ? 'Xác thực đăng ký tài khoản' : 'Đặt lại mật khẩu';
  const html = `
    <h2>Mã xác thực của bạn</h2>
    <p>Mã OTP: <strong>${otp}</strong></p>
    <p>Mã này có hiệu lực trong 5 phút.</p>
    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: html
  };

  return transporter.sendMail(mailOptions);
};

// Hash password
const hashPassword = (password) => {
  return bcrypt.hashSync(password, salt);
};

// Compare password
const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register user
const registerUser = async (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if user already exists
      const existingUser = await db.User.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        resolve({ success: false, message: 'Email đã tồn tại' });
        return;
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      await db.OTP.create({
        email: userData.email,
        otp: otp,
        type: 'register',
        expiresAt: expiresAt
      });

      // Send OTP via email
      await sendOTPEmail(userData.email, otp, 'register');

      resolve({ 
        success: true, 
        message: 'Mã OTP đã được gửi đến email của bạn' 
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Verify OTP and create user
const verifyOTPAndCreateUser = async (email, otp, userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find OTP in database
      const otpRecord = await db.OTP.findOne({
        where: {
          email: email,
          otp: otp,
          type: 'register',
          isUsed: false,
          expiresAt: { [db.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!otpRecord) {
        resolve({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
        return;
      }

      // Hash password
      const hashedPassword = hashPassword(userData.password);

      // Create user
      const newUser = await db.User.create({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: userData.role || 'staff',
        isVerified: true
      });

      // Mark OTP as used
      await otpRecord.update({ isUsed: true });

      // Generate token
      const token = generateToken(newUser);

      resolve({
        success: true,
        message: 'Đăng ký thành công',
        token: token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Login user
const loginUser = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find user by email
      const user = await db.User.findOne({
        where: { email: email }
      });

      if (!user) {
        resolve({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        resolve({ success: false, message: 'Tài khoản đã bị khóa' });
        return;
      }

      // Check if user is verified
      if (!user.isVerified) {
        resolve({ success: false, message: 'Tài khoản chưa được xác thực' });
        return;
      }

      // Compare password
      const isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        resolve({ success: false, message: 'Email hoặc mật khẩu không đúng' });
        return;
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate token
      const token = generateToken(user);

      resolve({
        success: true,
        message: 'Đăng nhập thành công',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Get user profile
const getUserProfile = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        resolve({ success: false, message: 'Không tìm thấy người dùng' });
        return;
      }

      resolve({
        success: true,
        user: user
      });

    } catch (error) {
      reject(error);
    }
  });
};

// Forgot password 
const forgotPassword = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find User By Email
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        resolve({ success: false, message: 'Không tìm thấy tài khoản với email này' });
        return;
      }

      // Mark All OTP as used
      await db.OTP.update(
        { isUsed: true },
        { where: { email, type: 'reset', isUsed: false } }
      );

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      await db.OTP.create({
        email: email,
        otp: otp,
        type: 'reset',
        expiresAt: expiresAt
      });

      // Send OTP via email
      await sendOTPEmail(email, otp, 'reset');

      resolve({
        success: true,
        message: 'Mã OTP đã được gửi đến email của bạn'
      });

    } catch (error) {
      reject(error);
    }
  });
};


// Verify Reset OTP
const verifyResetOTP = async (email, otp) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find OTP in database
      const otpRecord = await db.OTP.findOne({
        where: {
          email: email,
          otp: otp,
          type: 'reset',
          isUsed: false,
          expiresAt: { [db.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!otpRecord) {
        resolve({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
        return;
      }

      // Mark OTP as used
      await otpRecord.update({ isUsed: true });

      resolve({
        success: true,
        message: 'Xác thực OTP thành công, bạn có thể đặt lại mật khẩu.'
      });      
    } catch (error) {
      reject(error);
    }
  });
}

// Reset Password
const resetPassword = async (email, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Hash password
      const hashedPassword = hashPassword(newPassword);

      // Update Password
      const [rowsUpdated] = await db.User.update(
        { password: hashedPassword },
        { where: { email: email } }
      );

      // Check If User Exists
      if (rowsUpdated === 0) {
        resolve({ success: false, message: 'Không tìm thấy tài khoản để đặt lại mật khẩu' });
        return;
      }

      resolve({ success: true, message: 'Đặt lại mật khẩu thành công' });
      
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  registerUser,
  verifyOTPAndCreateUser,
  loginUser,
  getUserProfile,
  generateToken,
  forgotPassword,  
  verifyResetOTP,
  resetPassword
};
