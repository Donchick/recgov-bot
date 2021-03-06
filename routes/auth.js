var express = require('express');
var router = express.Router();
const userStorage = require('../storage/userStorage');
const { v4: uuidv4 } = require('uuid');

const sessionTokenName = 'session-token';
const authorizedUsers = {};

function isValidUser(login, password) {
  return userStorage.isValidUser(login, password);
}

router.post('/login', function(req, res, next) {
  if (!req.body.login) {
    res.status(400).send(new Error('unspecified-login'));
    return;
  }

  if (!req.body.password) {
    res.status(400).send(new Error('unspecified-password'));
    return;
  }

  if (req.headers[sessionTokenName] && authorizedUsers[req.body.login] === req.headers[sessionTokenName]) {
    res.sendStatus(200);
    return;
  }

  if (isValidUser(req.body.login, req.body.password)) {
    const newSessionToken = uuidv4();
    authorizedUsers[req.body.login] = newSessionToken;
    res.set(sessionTokenName, newSessionToken);
    res.sendStatus(200);
  }

  res.status(400).send(new Error('unknown-user'));
});

router.post('/logout', function(req, res) {
  if (!req.body.login) {
    res.status(400).send(new Error('unspecified-login'));
    return;
  }

  if (req.headers[sessionTokenName]) {
    delete authorizedUsers[req.body.login];
  }

  res.sendStatus(200);
});

router.post('/register', function(req, res) {
  if (!req.body.login) {
    res.status(400).send(new Error('unspecified-login'));
    return;
  }

  if (!req.body.password) {
    res.status(400).send(new Error('unspecified-password'));
    return;
  }

  if (!req.body.notificationClients) {
    res.status(400).send(new Error('unspecified-notification-client'));
    return;
  }

  if (req.body.notificationClients.some((client) => userStorage.NOTIFY_CLIENT_OPTIONS[client.resource] === undefined)) {
    res.status(400).send(new Error('unknown-notification-client'));
    return;
  }

  if (req.body.notificationClients.some((client) =>
      !userStorage.NOTIFY_CLIENT_PATH_PATTERNS[userStorage.NOTIFY_CLIENT_OPTIONS[client.resource]].test(client.path))) {
    res.status(400).send(new Error('unknown-notification-path-invalid'));
    return;
  }

  if (isValidUser(req.body.login, req.body.password)) {
    res.status(400).send(new Error('account-already-exists'));
    return;
  }

  userStorage.addUser(req.body.login, req.body.password, req.body.notificationClients);

  const newSessionToken = uuidv4();
  authorizedUsers[req.body.login] = newSessionToken;
  res.set(sessionTokenName, newSessionToken);
  res.sendStatus(200);
});

module.exports = router;