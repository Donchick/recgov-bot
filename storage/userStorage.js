const uuidV1 = require('uuid/v1');
const users = new Map();

const NOTIFY_CLIENT_OPTIONS = {
  'email': 'EMAIL',
  'facebook': 'FACEBOOK',
  'whatsapp': 'WHATSAPP',
};

function addUser(login, password, notificationClients) {
  const id = uuidV1();
  return users.set(id, {
    login,
    password,
    notifyOptions: notificationClients.reduce((options, client) => {
      options[client.resource] = client.path;
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

module.exports = {
  addUser,
  isValidUser,
  NOTIFY_CLIENT_OPTIONS,
};