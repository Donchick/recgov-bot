const subscriptionStorage = require('../storage/subscriptionStorage');

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
  }
}

module.exports = SubscribeController;