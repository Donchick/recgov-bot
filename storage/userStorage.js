const { v4: uuidv4 } = require('uuid');
const users = new Map();

const NOTIFY_CLIENT_OPTIONS = {
  'email': 'EMAIL',
  'facebook': 'FACEBOOK',
  'whatsapp': 'WHATSAPP',
};

const NOTIFY_CLIENT_PATH_PATTERNS = {
  'WHATSAPP': /^\+\d{11}/,
};

function addUser(login, password, notificationClients) {
  const id = uuidv4();
  return users.set(id, {
    login,
    password,
    notifyOptions: notificationClients.reduce((options, client) => {
      options[NOTIFY_CLIENT_OPTIONS[client.resource]] = client.path;
      return options;
    }, {}),
  });
}


function isValidUser(login, password) {
  for(let user of users.values()) {
    if (user.login ===login && user.password === password) {
      return true;
    }
  }
  return false;
}

function getUserNotifyOptions(userId) {
  return users.get(userId).notifyOptions;
}

module.exports = {
  addUser,
  isValidUser,
  getUserNotifyOptions,
  NOTIFY_CLIENT_OPTIONS,
  NOTIFY_CLIENT_PATH_PATTERNS,
};