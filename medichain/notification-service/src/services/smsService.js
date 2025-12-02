const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.log('SMS Mock:', to, message);
      return true;
    }
    await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (err) {
    console.error('SMS error:', err);
    return false;
  }
};

module.exports = { sendSMS };
