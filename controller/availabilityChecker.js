const {campMonthsToRequest, subscriptions} = require('../storage/subscriptionStorage');
const UserNotifier = require("../api/userNotifier");
const HttpDdosService = require('../api/httpDdosService');
const HttpService = require('../api/httpService');

class AvailabilityChecker {
  #path = "https://www.recreation.gov/api/camps/availability/campground/";
  #ddosService = null;
  #ddosCount = 10;

  constructor() {
    this.#ddosService = new HttpDdosService(this.#ddosCount);
    this.startCheck();
  }

  async startCheck() {
    await this.check();
    setTimeout(this.startCheck.bind(this), 0);
  }

  parseResponses(responses) {
    return responses.reduce((campsitesAvailability, {campsites}) => {
      Object.values(campsites).forEach(({site, availabilities}) => {
        Object.entries(availabilities).forEach(([date, availability]) => {
          if (availability === "Available") {
            if (!campsitesAvailability[site]) {
              campsitesAvailability[site] = {};
            }

            const formattedDate = date.split("T")[0];
            campsitesAvailability[site][formattedDate] = true;
          }
        })
      });

      return campsitesAvailability;
    }, {});
  }

  checkAvailability(availabilities, campId) {
    const campMatches = {};

    Object.entries(availabilities).forEach(([campsiteId, availability]) => {
      Object.keys(subscriptions[campId]).forEach((datesString) => {
        const dateStrings = datesString.split(":");

        if (dateStrings.every((dateStr) => availability[dateStr])) {
          const datesKey = `${dateStrings[0]}:${dateStrings[dateStrings.length - 1]}`;
          if (!campMatches[datesKey]) {
            campMatches[datesKey] = {
              campsiteIds: [],
              users: subscriptions[campId][datesString],
            };
          }

          campMatches[datesKey].campsiteIds.push(campsiteId);
        }
      });
    });

    return campMatches;
  }

  async check() {
    const requestsForCamps = Object.entries(campMonthsToRequest).map(([campId, months]) => {
      return {
        campId,
        requests: months.map((month) =>
          this.#path + campId + "/month?start_date=" +
          `${new Date().getFullYear()}-${month < 10 ? '0' + month : month}-01T00%3A00%3A00.000Z`
      )};
    });

    let promisesQueue = Promise.resolve();

    requestsForCamps.forEach(({campId, requests}) => {
      promisesQueue = promisesQueue.then(() => {
        return Promise.all(requests.map((request) => HttpService.send({path: request, type: 'GET'})))
            .then((responses) => this.parseResponses(responses))
            .then((availability) => this.checkAvailability(availability, campId))
            .then((campMatches) => {
              UserNotifier.notify(campId, campMatches);
              return Promise.resolve();
            })
            .catch((e) => console.log("request " + requests[0] + " failed" + e));
      }).then(() => new Promise((resolve) => setTimeout(resolve, 5*1000)));
    });

    return promisesQueue;

    // requestsForCamps.forEach(({campId, requests}) => {
    //   Promise.all(requests.map((request) => this.#ddosService.get(request)))
    //       .then((responses) => this.parseResponses(responses))
    //       .then((availability) => this.checkAvailability(availability, campId))
    //       .then((campMatches) => UserNotifier.notify(campId, campMatches))
    //       .catch((e) => console.log("request " + requests[0] + " failed" + e));
    // });

    // const nextTimerValue =
    //     requestsForCamps.reduce((sum, {requests}) => requests.length + sum, 0) * (60 / this.#ddosCount) * 1000;
    // setTimeout(() => this.check(), nextTimerValue < 10000 ? 10000 : nextTimerValue);
  }
}

module.exports = AvailabilityChecker;