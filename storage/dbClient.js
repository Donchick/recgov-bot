const redis = require("redis");
const {promisifyAll} = require("bluebird");

promisifyAll(redis);

class DbClient {
    constructor() {
        if (DbClient._instance) {
            return DbClient._instance;
        }
        DbClient._instance = this;

        DbClient._redisClient = redis.createClient({
            url: process.env.REDIS_URL,
            tls: {rejectUnauthorized: false}
        });
    }

    async getCampingSubscriptions() {
        return DbClient._redisClient.lrangeAsync("campRequests", 0, Number.MAX_SAFE_INTEGER)
            .then(
                (stringifiedCampsArray) => stringifiedCampsArray.map(
                    (stringifiedCamp) => JSON.parse(stringifiedCamp)));
    }

    async removeCampingSubscription(index) {
        await DbClient._redisClient.lsetAsync("campRequests", index, "DELETED");
        return DbClient._redisClient.lremAsync("campRequests", 1, "DELETED");
    }

    async addCampingSubscription(subscription) {
        await DbClient._redisClient.lpushAsync("campRequests", JSON.stringify({
            campId: subscription.campId,
            dates: subscription.dates
        }));
    }
}

module.exports = DbClient;