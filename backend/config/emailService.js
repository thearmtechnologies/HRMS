const { sendEmail } = require("./gmailClient");

exports.sendOtpEmail = async (toEmail, otp) => {
  const subject = "Your OTP for Email Verification";
  const text = `Your OTP is: ${otp}`;
  return sendEmail(toEmail, subject, text);
};

exports.sendWelcomeEmail = async (toEmail, name) => {
  const subject = "Welcome to Trade Syndicate";
  const text = `Dear ${name},\n\nYour Trade Syndicate account has been created successfully.\n\nBest regards,\nThe Trade Syndicate Team`;
  return sendEmail(toEmail, subject, text);
};

exports.sendAccountCreationEmail = async (toEmail, name, tempPassword) => {
  const subject = "Your Trade Syndicate Account Has Been Created";
  const text = `Dear ${name},\n\nYour account has been created successfully.\n\nYour login email: ${toEmail}\nYour temporary password: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest regards,\nThe Trade Syndicate Team`;
  return sendEmail(toEmail, subject, text);
};

exports.sendSubscribeEmail = async (email) => {
  const subject = "Welcome to Trade Syndicate!";
  const text = `Dear Subscriber,

Thank you for subscribing to Trade Syndicate! We are excited to have you with us.

Stay tuned for updates, offers, and more.

Best Regards,
The Trade Syndicate Team`;

  return sendEmail(email, subject, text);
};

exports.sendAdminEmail = async (formData) => {
  const subject = "New inquiry request to Trade Syndicate";
  const text = `New form submission:\n\nName: ${formData.name}\nNumber: ${formData.phone}\nEmail: ${formData.email}\nMessage: ${formData.message}`;

  return sendEmail(process.env.ADMIN_EMAIL, subject, text);
};

exports.sendConfirmationEmail = async (userEmail, formData) => {
  const subject = "Welcome to Trade Syndicate";
  const text = `Hello ${formData.name},\n\nThank you for contacting Trade Syndicate. Your submission has been received. Please wait for a moment, and one of our team members will reach out to you shortly.\n\nBest regards,\nTrade Syndicate,\nContact: +91-4048507745\nEmail: contact@tradesyndicate.in`;

  return sendEmail(userEmail, subject, text);
};

exports.sendPaySlip = async (
  toEmail,
  name,
  employeeId,
  month,
  year,
  pdfBuffer,
) => {
  const subject = "Your Pay Slip";
  const text = `Dear ${name},\n\nYour pay slip for ${month} ${year} is ready.\n\nTrade ID: ${employeeId}\n\nBest regards,\nThe Trade Syndicate Team`;

  const attachments = [
    {
      filename: `Payslip_${month}_${year}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ];

  return sendEmail(toEmail, subject, text, attachments);
};

exports.sendVerificationStatusEmail = async (toEmail, name, documentType, status, remarks) => {
  const documentNames = {
    pan: "PAN",
    aadhaar: "Aadhaar",
    bank: "bank details"
  };
  const docName = documentNames[documentType] || documentType;
  
  const subject = `Update on your ${docName} verification`;
  let text = `Dear ${name},\n\n`;
  
  if (status === 'verified') {
    text += `Your ${docName} details have been verified.`;
  } else if (status === 'rejected') {
    text += `Your ${docName} details were rejected.\nReason: ${remarks || 'No reason provided.'}`;
  }
  
  text += `\n\nBest regards,\nThe Trade Syndicate Team`;
  
  return sendEmail(toEmail, subject, text);
};
