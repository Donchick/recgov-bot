const subscriptionStorage = require('../storage/subscriptionStorage');
//const userStorage = require('userStorage');

class SubscribeController {
  /*
  static #deleteUserSubscriptions(userId) {
    return true;
  }
   */
  
  static subscribe(subscription) {
    try {
      subscriptionStorage.add(subscription);
    } catch (e) {
      throw new Error('camps-subscription-failed');
    }

    /*
    try {
      userStorage.add(subscription);
    } catch (e) {
      this.#deleteUserSubscriptions(subscription.userId);
      throw new Error('user-subscription-failed');
    }
     */
  }
}

module.exports = SubscribeController;