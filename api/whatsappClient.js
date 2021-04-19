const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);

class WhatsAppNotifier {
  static notify(phoneNumber, message) {
    try {
      client.messages.create({
        from: 'whatsapp:+14155238886',
        body: message,
        to: `whatsapp:${phoneNumber}`,
      });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = WhatsAppNotifier;