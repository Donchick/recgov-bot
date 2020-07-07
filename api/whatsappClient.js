const client = require('twilio')('ACe0297ba5794baa1802f580ffdee50b2d', 'SM753d930205f745e2bc9399e7d54f101c');

class WhatsAppNotifier {
  static notify(phoneNumber, message) {
    client.messages.create({
      from: 'whatsapp:+14155238886',
      body: message,
      to: `whatsapp:${phoneNumber}`,
    });
  }
}

module.exports = WhatsAppNotifier;