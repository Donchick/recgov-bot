const HttpService = require('HttpService');

class HttpDdosService {
  #delay = 1000;
  #promiseQueue = Promise.resolve();

  constructor(limitPerMinute) {
    this.#delay = 60000 / limitPerMinute;
  }

  async get(path) {
    return new Promise((resolve, reject) => {
        this.#promiseQueue = this.#promiseQueue.then(() => {
            console.log('request with id ' + path + ' has started at ' + Date.now());
            return true;
        }).then(() => {
            this.#makeRequest(path).then(() => {
                console.log('request with id ' + path + ' has finished at ' + Date.now())
            }).then(resolve).catch(reject);
        }).catch(() => {
            console.log("Some request died");
            Promise.resolve();
        }).finally(() => new Promise((resolve) => setTimeout(resolve, this.#delay)));
    });
  }

  #makeRequest(request) {
    return HttpService.send(request);
  }
}

module.exports.HttpDdosService = HttpDdosService;