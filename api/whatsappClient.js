const client = require('twilio')('ACe0297ba5794baa1802f580ffdee50b2d', '80f4ea918d7019d5a862d9c461468fe6');

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