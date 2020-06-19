const userStorage = require('../storage/userStorage');
const campDataStorage = require('../storage/campDataStorage');
const WhatsAppNotifier = require('../api/whatsappClient');

const CLIENT_NOTIFIER_BY_NAMES = {
  'WHATSAPP': WhatsAppNotifier,
};


function sendUserMessage(userId, message) {
  const userNotifyOptions = userStorage.getUserNotifyOptions(userId);
  for(let notifier in userNotifyOptions) {
    if (CLIENT_NOTIFIER_BY_NAMES[notifier]) {
      CLIENT_NOTIFIER_BY_NAMES[notifier].notify(userNotifyOptions[notifier], message);
    }
  }
}

class UserNotifier {
  static notify(campId, matchingList) {
    const campName = campDataStorage.getCampNameById(campId);
    Object.keys(matchingList).forEach((dateRange) => {
      const message =
          `${campName} has such available spots for requested period - from ${dateRange.split(':').join(' to ')}: ${matchingList[dateRange].campsiteIds.join(', ')}`;

      matchingList[dateRange].users.forEach((userId) => sendUserMessage(userId, message));
    });
  }
}

module.exports = UserNotifier;