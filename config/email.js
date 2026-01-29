const nodemailer = require("nodemailer");

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

// Send welcome email
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: '"Memories App" <noreply@memoriesapp.com>',
    to: toEmail,
    subject: `Welcome to Memories, ${userName}! 🥳`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #6366f1; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Memories</h1>
        </div>

        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="color: #1f2937;">Hi ${userName},</h2>
          <p>We’re so excited to have you join our community.</p>
          
          <p>The goal of <strong>Memories</strong> is simple: to give your most precious photos and the stories behind them a safe, beautiful place to live forever.</p>
          
          <p>Whether it’s a big milestone or a small, quiet moment, we can't wait to help you preserve it. You can start uploading your first story whenever you're ready.</p>
          
          <p style="margin-top: 25px;">Happy memory making!<br><strong>The Memories Team</strong></p>
        </div>

        <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #eee; font-size: 13px; color: #6b7280;">
          <p style="margin-bottom: 8px;">Built with ❤️ by the Amr CHATELAIN.</p>
          <a href="https://github.com/AmrChatelain" style="color: #6366f1; text-decoration: underline;">View the Developer's GitHub</a>
          <p style="margin-top: 20px; font-size: 11px;">&copy; 2026 Memories App. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWelcomeEmail };
