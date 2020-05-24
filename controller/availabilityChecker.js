const {campMonthsToRequest, subscriptions} = require('../storage/subscriptionStorage');
const WhatsAppNotifier = require("../api/whatsappClient");
const HttpDdosService = require('../api/httpDdosService');

class AvailabilityChecker {
  #path = "https://www.recreation.gov/api/camps/availability/campground/";
  #ddosService = null;
  #ddosCount = 120;

  constructor() {
    this.#ddosService = new HttpDdosService(this.#ddosCount);
    this.check();
  }

  parseResponses({campId, responses}) {
    return [campId, responses.reduce((campsitesAvailability, {campsites}) => {
      Object.entries(campsites).forEach(([campsiteId, {availabilities}]) => {
        Object.entries(availabilities).forEach(([date, availability]) => {
          if (availability === "Reserved") {
            if (!campsitesAvailability[campsiteId]) {
              campsitesAvailability[campsiteId] = {};
            }

            const formattedDate = date.split("T")[0];
            campsitesAvailability[campsiteId][formattedDate] = true;
          }
        })
      });

      return campsitesAvailability;
    }, {})];
  }

  checkAvailability(availabilities, campId) {
    console.log(subscriptions);
    console.log(availabilities);
    const campMatches = [];

    Object.entries(availabilities).forEach(([campsiteId, availability]) => {
      Object.keys(subscriptions[campId]).forEach((datesString) => {
        const dateStrings = datesString.split(":");

        if (dateStrings.every((dateStr) => availability[dateStr])) {
          campMatches.push({
            campsiteId,
            startDate: dateStrings[0],
            endDate: dateStrings[dateStrings.length - 1],
            users: subscriptions[campId][datesString],
          });
        }
      });
    });

    return [campId, campMatches];
  }

  check() {
    const requestsForCamps = Object.entries(campMonthsToRequest).map(([campId, months]) => {
      return {
        campId,
        requests: months.map((month) =>
          this.#path + campId + "/month?start_date=" +
          `${new Date().getFullYear()}-${month < 10 ? '0' + month : month}-01T00%3A00%3A00.000Z`
      )};
    });

    requestsForCamps.forEach(({campId, requests}) => {
      //?!??!?!?!????!?!!?!?!?
      Promise.all(requests.map((request) => this.#ddosService.get(request)))
          .then((responses) => this.parseResponses({campId, responses}))
          .then(([campId, availability]) => this.checkAvailability(availability, campId))
          .then(([campId, campMatches]) => WhatsAppNotifier.notify(campId, campMatches))
          .catch((e) => console.log("request " + requests[0] + " failed"));
    });

    const nextTimerValue =
        requestsForCamps.reduce((sum, {requests}) => requests.length + sum, 0) * (60 / this.#ddosCount);
    setTimeout(() => this.check(), nextTimerValue < 30000 ? 30000 : nextTimerValue);
  }
}

module.exports = AvailabilityChecker;