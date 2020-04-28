var express = require('express');
var router = express.Router();
const SubscribeController = require('../controller/subscribe');
let campSubscription = {};
let campToListen = {};

const WEEK_DAY_POSITION = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  0: 7
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Returns set of appropriate dates in a row.
 * [[05-25-2020, 05-26-2020, 05-27-2020], [05-26-2020, 05-27-2020, 05-28-2020]]
 * for startDate - 05-25-2020, endDate - 05-28-2020, daysInRow - 3.
 * @param {!Date} startDate
 * @param {!Date} endDate
 * @param {number} daysInRow
 * @return {!Array<!Array<string>>}
 * @private
 */
function getDatesInRow_(startDate, endDate, daysInRow) {
  const appropriateDatesSet = [];
  const everyDayStartDate = new Date(startDate);

  while (endDate - everyDayStartDate >= (daysInRow - 1) * DAY_IN_MS) {
    const appropriateDatesInRow = [];
    const localStartDate = new Date(everyDayStartDate);

    do {
      appropriateDatesInRow.push(localStartDate.toISOString().split('T')[0]);
      localStartDate.setDate(localStartDate.getDate() + 1);
    } while (appropriateDatesInRow.length < daysInRow);

    appropriateDatesSet.push(appropriateDatesInRow);
    everyDayStartDate.setDate(everyDayStartDate.getDate() + 1);
  }

  return appropriateDatesSet;
}

/**
 *
 * @param {!Date} startDate
 * @param {!Date} endDate
 * @param {number} daysInRow
 * @return {!Array<!Array<string>>}
 * @private
 */
function getRequiredDates_(startDate, endDate, requiredDays) {
  const appropriateDatesSet = [];
  const date = new Date(startDate);

  while(WEEK_DAY_POSITION[date.getDay()] !== requiredDays[0]) {
    date.setDate(date.getDate() + 1);
  }

  while(date <= endDate) {
    const appropriateRequiredDates = [];
    const dateToOperate = new Date(date);

    requiredDays.forEach((dayIndex, index) => {
      appropriateRequiredDates.push(dateToOperate.toISOString().split('T')[0]);
      let daysRangeToNextDate = 0;

      if (index < requiredDays.length - 1) {
        if (requiredDays[index + 1] > dayIndex) {
          daysRangeToNextDate = requiredDays[index + 1] - dayIndex;
        } else {
          daysRangeToNextDate = 7 - dayIndex + requiredDays[index + 1];
        }
        dateToOperate.setDate(dateToOperate.getDate() + daysRangeToNextDate);
      } else {
        date.setDate(date.getDate() + 7);
      }
    });

    appropriateDatesSet.push(appropriateRequiredDates);
  }

  return appropriateDatesSet;
}

function getAppropriateDates(startDateStr, endDateStr, requiredDays, daysInRow) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  switch (true) {
    case Boolean(requiredDays && requiredDays.length > 0):
      return getRequiredDates_(startDate, endDate, requiredDays);
    case Boolean(daysInRow):
      return getDatesInRow_(startDate, endDate, daysInRow);
    default:
      throw Error("Dates can't be retrieved, no input data.");
  }
}

function updateCampToListen(camp) {
  if (!campToListen[camp.campId]) {
    campSubscription[camp.campId] = [];
  }

  const startDate = new Date(camp.startDate);
  const endDate = new Date(camp.endDate);

  const tempData = [];
  for (let i = startDate.getMonth(); i <= endDate.getMonth(); i++) {
    tempData.push(i);
  }
  let i = 0;
  let j = 0;
  const data = [];
  while(true) {
    if (j === tempData.length - 1 && i === campToListen[camp.campId].length - 1) {
      break;
    }
    while (campToListen[camp.campId][i] < tempData[j]) {
      data.push(campToListen[camp.campId][i]);
      i++;
    }

    if (campToListen[camp.campId][i] === tempData[j]) {
      j++;
    }

    while (tempData[j] < campToListen[camp.campId][i]) {
      data.push(tempData[j]);
      j++;
    }
  }

  campSubscription[camp.campId] = data;
}


function subscribe_(subscriber) {
  subscriber.camps.forEach((camp) => {
    if (!campSubscription[camp.campId]) {
      campSubscription[camp.campId] = {};
    }

    updateCampToListen(camp);

    campSubscription[camp.campId][subscriber.phoneNumber] = 
        getAppropriateDates(camp.startDate, camp.endDate, camp.requiredDays, camp.daysInRow);
  });
}

const DATE_FORMAT_REGEX = new RegExp('^(0[1-9])|11|12-(0[1-9])|(2[0-9])|3[0-1]-202' + new Date().getFullYear().toString()[3]);
const NOTIFY_CLIENT_OPTIONS = {
  'email': 'EMAIL',
  'facebook': 'FACEBOOK',
  'whatsapp': 'WHATSAPP',
};

function validateCampSubscription(subscription) {
  const validationResult = {
    valid: true,
    errors: [],
  };
  if (!subscription.campId) {
    validationResult.valid = false;
    validationResult.errors.push('unknown-camp-id');
  }
  if (!subscription.startDate) {
    validationResult.valid = false;
    validationResult.errors.push('unknown-start-date');
  } else if (!DATE_FORMAT_REGEX.test(subscription.startDate)) {
    validationResult.valid = false;
    validationResult.errors.push('invalid-start-date-format');
  }
  if (!subscription.endDate) {
    validationResult.valid = false;
    validationResult.errors.push('unknown-end-date');
  } else if (!DATE_FORMAT_REGEX.test(subscription.endDate)) {
    validationResult.valid = false;
    validationResult.errors.push('invalid-end-date-format');
  }

  return validationResult;
}

function validateSubscriber(subscriber) {
  const validationResult = {
    valid: true,
    errors: [],
  };

  if (!subscriber.notifyClient) {
    validationResult.valid = false;
    validationResult.errors.push('empty-notify-client');
  } else if (!NOTIFY_CLIENT_OPTIONS[subscriber.notifyClient]) {
    validationResult.valid = false;
    validationResult.errors.push('unknown-notify-client');
  }

  if (!subscriber.userId) {
    validationResult.valid = false;
    validationResult.errors.push('unknown-user');
  }

  if (!subscriber.camps && subscriber.camps.length === 0) {
    validationResult.valid = false;
    validationResult.errors.push('empty-camp-list');
  } else if (subscriber.camps.length > 4) {
    validationResult.valid = false;
    validationResult.errors.push('camp-list-contains-to-many-elements');
  } else {
    subscriber.camps.forEach((campSubscription) => {
      const campSubscriptionValidationResult =
          validateCampSubscription(campSubscription);

      validationResult.valid = validationResult.valid
          && campSubscriptionValidationResult.valid;

      validationResult.errors.push(...campSubscriptionValidationResult.errors);
    });
  }

  return validationResult;
}

/* GET home page. */
router.post('/subscribe', function(req, res, next) {
  if (!req.body.subscriber) {
    res.error('Subscriber body is empty.');
  }

  const subscriber = JSON.parse(req.body.subscriber);

  const validationResult = validateSubscriber(subscriber);

  if (!validationResult.valid) {
    res.error(validationResult.errors);
  }

  try {
    SubscribeController.subscribe(subscriber);
  } catch (e) {
    res.error(e.message);
  }

  res.send();
});

module.exports = router;
