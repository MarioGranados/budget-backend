// services/mailer.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set your SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = (toEmail, verificationCode) => {
  const msg = {
    to: toEmail, // Recipient email address
    from: 'thecloudydeveloper@gmail.com', // Verified sender email (could be any custom domain you verified in SendGrid)
    subject: 'Email Verification',
    text: `Your verification code is: ${verificationCode}`,
  };

  return sgMail.send(msg); // Send the email
};

module.exports = { sendVerificationEmail };
