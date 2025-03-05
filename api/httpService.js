const {get} = require("node:https");

const REQUEST_TYPE = {
  GET: 'GET',
};

const REQUEST_METHOD = {
  GET: 'get',
};

function validateRequest(request) {
  if (!request) {
    return {
      valid: false,
      message: 'request can\'t be empty',
    };
  }

  if (!request.path) {
    return {
      valid: false,
      message: 'request has to have a path',
    };
  }

  if (REQUEST_TYPE[request.type] !== REQUEST_TYPE.GET) {
    return {
      valid: false,
      message: 'request can be GET only',
    };
  }

  return {
    valid: true,
  };
}

class HttpService {
  static async send(request) {
    const validationObject = validateRequest(request);
    if (validationObject.valid === false) {
      throw new Error(validationObject.message);
    }

    return this[REQUEST_METHOD[REQUEST_TYPE[request.type]]](request);
  }

  static async get({path}) {
    return new Promise((resolve, reject) => {
      get(path, (res) => {
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (e) => {
        reject(e);
      });
    });
  }
}

module.exports = HttpService;