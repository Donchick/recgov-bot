const uuidV1 = require('uuid/v1');
const users = new Map();

const NOTIFY_CLIENT_OPTIONS = {
  'email': 'EMAIL',
  'facebook': 'FACEBOOK',
  'whatsapp': 'WHATSAPP',
};

function addUser(login, password) {
  const id = uuidV1();
  return users.set(id, {
    login,
    password,
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
};