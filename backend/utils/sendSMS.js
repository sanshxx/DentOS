const twilio = require('twilio');

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - SMS message body
 * @returns {Promise<void>}
 */
const sendSMS = async (to, message) => {
  // Create Twilio client
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Format phone number if needed (ensure it has +91 prefix for India)
  let formattedNumber = to;
  if (!to.startsWith('+')) {
    formattedNumber = `+91${to}`;
  }

  // Send SMS
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedNumber
  });
};

module.exports = sendSMS;