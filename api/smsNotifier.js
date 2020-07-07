const accountSid = 'ACe0297ba5794baa1802f580ffdee50b2d';
const authToken = '80f4ea918d7019d5a862d9c461468fe6';
const client = require('twilio')(accountSid, authToken);

class SMSNotifier {
  static notify(phoneNumber, message) {
    client.messages.create({
      body: message,
      from: '+12058982738',
      messagingServiceSid: 'MG5336d74623140da8440c5168925c707b',
      to: phoneNumber
    }).done();
  }
}

module.exports = SMSNotifier;