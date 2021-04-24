const HttpService = require('./httpService');

class HttpDdosService {
  #delay = 1000;
  #promiseQueue = Promise.resolve();

  constructor(limitPerMinute) {
    this.#delay = 60000 / limitPerMinute;
  }

  async get(path) {
    return new Promise((resolve, reject) => {
        this.#promiseQueue = this.#promiseQueue.then(() => {
            console.log(`Making ${path}`);
            this.makeRequest({path, type: 'GET'}).then((response) => {
              resolve(response);
            }).catch((error) => {
              reject(error);
            });
        }).catch(() => {
            Promise.resolve();
        }).finally(() => new Promise((resolve) => setTimeout(resolve, this.#delay)));
    });
  }

  makeRequest(request) {
    return HttpService.send(request);
  }
}

module.exports = HttpDdosService;