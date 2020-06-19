const client = require('twilio')('ACb67f35e630996ee0c4130f80a9461d9f', 'c580c9b731d63fd86ddd460c9372c0a2');

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