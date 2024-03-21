var express = require('express');
var router = express.Router();
const SubscribeController = require('../controller/subscribe');
const CampDataStorage = require("../storage/campDataStorage");
const {subscriptions} = require('../storage/subscriptionStorage');
const DbClient = require("../storage/dbClient");
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

    while (WEEK_DAY_POSITION[date.getDay()] !== requiredDays[0]) {
        date.setDate(date.getDate() + 1);
    }

    while (date <= endDate) {
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
    while (true) {
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

const DATE_FORMAT_REGEX = new RegExp(`^202${new Date().getFullYear().toString()[3]}-((0[1-9])|11|12)-((0[1-9])|(2[0-9])|3[0-1])`);
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
    if (!subscription.dates) {
        validationResult.valid = false;
        validationResult.errors.push('unknown-dates');
    } else if (subscription.dates.some((dateStr) => {
        return !DATE_FORMAT_REGEX.test(dateStr);
    })) {
        validationResult.valid = false;
        validationResult.errors.push('invalid-date-format');
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
        validationResult.errors.push('undefined-user');
    }

    if (!subscriber.camps || subscriber.camps.length === 0) {
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
router.post('/subscribe', function (req, res, next) {
    if (!req.body.subscriber) {
        throw {
            type: 'invalid-argument',
            errors: ['empty-subscriber-body']
        };
    }

    const subscriber = req.body.subscriber;

    const validationResult = validateSubscriber(subscriber);

    if (!validationResult.valid) {
        throw {
            type: 'invalid-argument',
            errors: validationResult.errors,
        };
    }

    try {
        SubscribeController.subscribe(subscriber);
    } catch (e) {
        throw {
            type: 'subscription-error',
            errors: [e.message],
        };
    }

    res.send();
});

router.get('/camping-dates', async (req, res) => {
    const campSubscriptions = await (new DbClient()).getCampingSubscriptions();

    res.json({items: campSubscriptions.map(({campId, dates}, index) => ({
            id: index,
            value: `${CampDataStorage.getCampNameById(campId)}: ${dates}`
    }))});
});

router.delete('/camping-dates/:id', async (req, res) => {
    const dbClient = new DbClient();
    await dbClient.removeCampingSubscription(req.params.id);
    const campSubscriptions = await dbClient.getCampingSubscriptions();

    res.json({items: campSubscriptions.map(({campId, dates}, index) => ({
            id: index,
            value: `${CampDataStorage.getCampNameById(campId)}: ${dates}`
        }))});
});

router.post('/camping-dates', async (req, res) => {
    const dbClient = new DbClient();
    await dbClient.addCampingSubscription(req.body.subscription);
    const campSubscriptions = await dbClient.getCampingSubscriptions();

    res.json({items: campSubscriptions.map(({campId, dates}, index) => ({
            id: index,
            value: `${CampDataStorage.getCampNameById(campId)}: ${dates}`
        }))}).setHeader("Access-Control-Allow-Origin", "https://recgov-bot.herokuapp.com/");
});

module.exports = router;
