const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (email, firstName, role, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Chào mừng bạn đến với công ty!',
    html: `
      <h2>Chào mừng ${firstName}!</h2>
      <p>Bạn đã được tạo tài khoản nhân viên mới với chức vụ: <strong>${role}</strong>.</p>
      <p>Mật khẩu tạm thời của bạn là: <strong>${password}</strong></p>
      <p>Vui lòng đăng nhập và thay đổi mật khẩu ngay sau lần đầu tiên đăng nhập để bảo mật.</p>
      <p>Chúc bạn làm việc hiệu quả và vui vẻ!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };