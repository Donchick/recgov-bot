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
    }

    async startCheck() {
        await this._check();
    }

    parseResponses(responses) {
        return responses.reduce((campsitesAvailability, {campsites}) => {
            Object.values(campsites).forEach(({site, availabilities, campsite_type}) => {
                if (campsite_type === 'STANDARD NONELECTRIC') {
                    Object.entries(availabilities).forEach(([date, availability]) => {
                        if (availability === "Available") {
                            if (!campsitesAvailability[site]) {
                                campsitesAvailability[site] = {};
                            }

                            const formattedDate = date.split("T")[0];
                            campsitesAvailability[site][formattedDate] = true;
                        }
                    })
                }
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


    async _check() {
        const requestsQueue = Object.entries(campMonthsToRequest).flatMap(([campId, months]) => {
            return months.map((month) => ({
                campId: campId,
                request: this.#path + campId + "/month?start_date=" +
                    `${new Date().getFullYear()}-${month < 10 ? '0' + month : month}-01T00%3A00%3A00.000Z`
            }));
        });

        let requestIndex = -1;
        while (requestsQueue.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
            requestIndex++;
            if (requestIndex === requestsQueue.length) {
                requestIndex = 0;
            }
            let response, parsedResponse, availabilityMatches;
            try {
                response = await HttpService.send({path: requestsQueue[requestIndex]['request'], type: 'GET'});
            } catch (e) {
                console.log("availability check failed for request " + requestsQueue[requestIndex]['request'] + " failed with" + e + " at " + new Date());
                continue;
            }
            try {
                parsedResponse = this.parseResponses([response]);
            } catch (e) {
                console.log("failed to parse response for request " + requestsQueue[requestIndex]['request'] + " with " + e + " at " + new Date());
                continue;
            }
            try {
                availabilityMatches = this.checkAvailability(parsedResponse, requestsQueue[requestIndex]['campId']);
            } catch (e) {
                console.log("failed to match availabilities for request " + requestsQueue[requestIndex]['request'] + " with" + e + " at " + new Date());
                continue;
            }
            try {
                UserNotifier.notify(requestsQueue[requestIndex]['campId'], availabilityMatches);
            } catch (e) {
                console.log("failed to notify user for request " + requestsQueue[requestIndex]['request'] + " with" + e + " at " + new Date());
                continue;
            }
            console.log("availability check succeeded for request " + requestsQueue[requestIndex]['request'] + " at " + new Date());
        }
    }
}

module.exports = AvailabilityChecker;