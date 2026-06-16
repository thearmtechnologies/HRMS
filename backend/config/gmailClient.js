const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a reusable transporter using SMTP (Gmail, etc.)
// Make sure to add EMAIL_USER and EMAIL_PASS to your .env file
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to another service if not using Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
  },
});

/**
 * Send email (supports optional attachments)
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {Array} attachments - Optional array of attachments [{ filename, content, contentType }]
 */
async function sendEmail(to, subject, text, attachments = []) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendEmail };
