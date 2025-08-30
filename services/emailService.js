const nodemailer = require('nodemailer');

/**
 * 📧 EMAIL SERVICE
 * Service for sending emails (verification, password reset, etc.)
 */
class EmailService {
  constructor() {
    // Configure email transporter (using Gmail as example)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_PASSWORD // your-app-password
      }
    });

    // You can also use other providers like SendGrid, Mailgun, etc.
    // this.transporter = nodemailer.createTransporter({
    //   host: 'smtp.sendgrid.net',
    //   port: 587,
    //   auth: {
    //     user: 'apikey',
    //     pass: process.env.SENDGRID_API_KEY
    //   }
    // });

    this.from = process.env.EMAIL_FROM || 'SnackTrack <noreply@snacktrack.com>';
  }

  /**
   * 📨 Send email verification
   */
  async sendEmailVerification(user, token) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: this.from,
        to: user.email,
        subject: '✅ Verify Your SnackTrack Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome to SnackTrack! 🥗</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for signing up for SnackTrack! Please verify your email address to complete your registration.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours. If you didn't create this account, please ignore this email.
            </p>
            
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} SnackTrack. All rights reserved.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${user.email}`);
      return result;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  /**
   * 🔒 Send password reset email
   */
  async sendPasswordReset(user, token) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: this.from,
        to: user.email,
        subject: '🔒 Reset Your SnackTrack Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your SnackTrack password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${user.email}`);
      return result;

    } catch (error) {
      console.error('❌ Password reset email failed:', error);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  /**
   * 🎉 Send welcome email (after verification)
   */
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: this.from,
        to: user.email,
        subject: '🎉 Welcome to SnackTrack!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome to SnackTrack! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>Your email has been verified successfully! You're now ready to start your healthy eating journey.</p>
            
            <h3>What you can do with SnackTrack:</h3>
            <ul>
              <li>📱 Scan product barcodes for instant health assessments</li>
              <li>📷 Upload nutrition label photos using OCR</li>
              <li>🎯 Get personalized recommendations based on your health profile</li>
              <li>⚠️ Receive allergy and dietary restriction alerts</li>
              <li>📊 Track your scanning history and health progress</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Start Scanning Products
              </a>
            </div>
            
            <p>Happy healthy eating! 🥗</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${user.email}`);
      return result;

    } catch (error) {
      console.error('❌ Welcome email failed:', error);
      // Don't throw error for welcome emails - they're nice to have
      return null;
    }
  }

  /**
   * 🔧 Test email configuration
   */
  async testEmailConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service configured correctly');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();