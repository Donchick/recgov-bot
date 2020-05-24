const requestPromise = require('request-promise');

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
    return requestPromise({
      uri: path,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response});
    }).then((response) => {
      return response;
    });
  }
}

module.exports = HttpService;