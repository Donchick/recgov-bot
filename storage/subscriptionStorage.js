const subscriptions = {};
const campMonthsToRequest = {};

function add_(campSubscription, userId) {
  const {campId, dates} = campSubscription;
  const filteredDates = dates.map((date) => {
    const dateSteps = date.split("-");
    return new Date(
      Date.UTC(
        Number(dateSteps[0]),
        Number(dateSteps[1]) - 1,
        Number(dateSteps[2]),
        0,
        new Date().getTimezoneOffset()));
  }).sort((a, b) => a > b ? b : a);
  const datesKey = filteredDates.map(
      (date) => date.toISOString().split("T")[0]).join(":");

  if (!subscriptions[campId]) {
    subscriptions[campId] = {};
  }

  if (!subscriptions[campId][datesKey]) {
    subscriptions[campId][datesKey] = [];
  }

  subscriptions[campId][datesKey].push(userId);

  if (!campMonthsToRequest[campId]) {
    campMonthsToRequest[campId] = [];
  }

  const startMonth = filteredDates[0].getMonth() + 1;
  const endMonth = filteredDates[filteredDates.length - 1].getMonth() + 1;

  for(let i = startMonth; i <= endMonth; i++) {
    if (!campMonthsToRequest[campId].includes(i)) {
      campMonthsToRequest[campId].push(i);
    }
  }

  campMonthsToRequest[campId].sort((a, b) => a - b);
}

function add(subscriber) {
  subscriber.camps.forEach((campSubscription) => {
    add_(campSubscription, subscriber.userId);
  });
}

module.exports = {add, subscriptions, campMonthsToRequest};