const userStorage = require('../storage/userStorage');
const campDataStorage = require('../storage/campDataStorage');
const WhatsAppNotifier = require('../api/whatsappClient');

const CLIENT_NOTIFIER_BY_NAMES = {
  'WHATSAPP': WhatsAppNotifier,
};


function sendUserMessage(userSessionId, message) {
  const userNotifyOptions = userStorage.getUserNotifyOptions(userSessionId);
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
      const dates = dateRange.split(':');
      const availableDatesMessage = dates.length === 1 ? dates[0] : dates.filter((element, index) => dates.indexOf(element) === index).join(' - ');
      const message =
          `${campName} - ${matchingList[dateRange].campsiteIds.join(', ')}:\n${availableDatesMessage}\nhttps://www.recreation.gov/camping/campgrounds/${campId}/availability`;

      matchingList[dateRange].users.forEach((userId) => sendUserMessage(userId, message));
    });
  }
}

module.exports = UserNotifier;