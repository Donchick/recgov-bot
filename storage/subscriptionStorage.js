const subscriptions = {};

function add_(campSubscription, userId) {
  const {campId, startDate, endDate} = campSubscription;

  if (!subscriptions[campId]) {
    subscriptions[campId] = {};
  }

  if (!subscriptions[campId][`${startDate}-${endDate}`]) {
    subscriptions[campId][`${startDate}-${endDate}`] = [];
  }

  subscriptions[campId][`${startDate}-${endDate}`].push(userId);
}

function add(subscriber) {
  subscriber.camps.forEach((campSubscription) => {
    add_(campSubscription, subscriber.userId);
  });
}

module.exports = {add, subscriptions};