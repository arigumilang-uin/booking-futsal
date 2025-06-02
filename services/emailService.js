const nodemailer = require('nodemailer');

// Email service configuration
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration exists
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.log('📧 Email service not configured - SMTP credentials missing');
        return;
      }

      this.transporter = nodemailer.createTransporter(emailConfig);
      this.isConfigured = true;
      console.log('📧 Email service initialized successfully');
    } catch (error) {
      console.error('📧 Email service initialization failed:', error);
    }
  }

  async verifyConnection() {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      console.log('📧 Email not sent - service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Futsal Booking'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('📧 Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Email templates
  generatePasswordResetEmail(name, resetLink, token) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Password</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Kami menerima permintaan untuk reset password akun Anda di Futsal Booking System.</p>
            <p>Klik tombol di bawah untuk reset password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>Atau copy link berikut ke browser Anda:</p>
            <p><a href="${resetLink}">${resetLink}</a></p>
            <p><strong>Token:</strong> ${token}</p>
            <p>Link ini akan expired dalam 1 jam.</p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
          </div>
          <div class="footer">
            <p>© 2025 Futsal Booking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Reset Password - Futsal Booking System
      
      Halo ${name},
      
      Kami menerima permintaan untuk reset password akun Anda.
      
      Klik link berikut untuk reset password:
      ${resetLink}
      
      Token: ${token}
      
      Link ini akan expired dalam 1 jam.
      
      Jika Anda tidak meminta reset password, abaikan email ini.
    `;

    return { html, text };
  }

  generateEmailVerificationEmail(name, verificationLink, token) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifikasi Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verifikasi Email</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Terima kasih telah mendaftar di Futsal Booking System!</p>
            <p>Klik tombol di bawah untuk verifikasi email Anda:</p>
            <a href="${verificationLink}" class="button">Verifikasi Email</a>
            <p>Atau copy link berikut ke browser Anda:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
            <p><strong>Token:</strong> ${token}</p>
            <p>Link ini akan expired dalam 24 jam.</p>
          </div>
          <div class="footer">
            <p>© 2025 Futsal Booking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verifikasi Email - Futsal Booking System
      
      Halo ${name},
      
      Terima kasih telah mendaftar di Futsal Booking System!
      
      Klik link berikut untuk verifikasi email:
      ${verificationLink}
      
      Token: ${token}
      
      Link ini akan expired dalam 24 jam.
    `;

    return { html, text };
  }

  generateBookingNotificationEmail(name, booking) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notifikasi Booking</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Notifikasi Booking</h1>
          </div>
          <div class="content">
            <p>Halo ${name},</p>
            <p>Ada update untuk booking Anda:</p>
            <div class="booking-details">
              <h3>Detail Booking</h3>
              <p><strong>Booking Number:</strong> ${booking.booking_number}</p>
              <p><strong>Lapangan:</strong> ${booking.field_name}</p>
              <p><strong>Tanggal:</strong> ${booking.date}</p>
              <p><strong>Waktu:</strong> ${booking.start_time} - ${booking.end_time}</p>
              <p><strong>Status:</strong> ${booking.status}</p>
              <p><strong>Total:</strong> Rp ${booking.total_amount?.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Futsal Booking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { html, text: `Booking ${booking.booking_number} - Status: ${booking.status}` };
  }
}

// Export singleton instance
module.exports = new EmailService();
