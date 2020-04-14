var express = require('express');
var router = express.Router();
let dataBase = {};

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


function subscribe_(subscriber) {
  subscriber.camps.forEach((camp) => {
    if (!dataBase[camp.campId]) {
      dataBase[camp.campId] = {}
    }

    dataBase[camp.campId][subscriber.phoneNumber] = 
        getAppropriateDates(camp.startDate, camp.endDate, camp.requiredDays, camp.daysInRow);
  });
}

/* GET home page. */
router.post('/subscribe', function(req, res, next) {
  if (!req.body.subscriber) {
    res.error("Subscriber body is empty.");
  }

  const subscriber = JSON.parse(req.body.subscriber);
  
  if (!subscriber.camps || subscriber.camps.length === 0) {
    res.error("Subscriber body doesn't have camp to look for.");
  }

  subscribe_(subscriber);

  res.send(dataBase);
});

module.exports = router;
