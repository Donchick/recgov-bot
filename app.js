var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const AvailabilityChecker = require('./controller/availabilityChecker');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
const {addUser} = require('./storage/userStorage');
const subscriptionStorage = require('./storage/subscriptionStorage');
const WhatsAppNotifier = require('./api/whatsappClient');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', apiRouter);
app.use('/api/auth', authRouter);
app.post('/status', (req, res) => {
  WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger is working!');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    type: err.type,
    errors: err.errors
  });
});

app.listen(3001, () => {
  console.log("Server started!");
  const usersDB = addUser('donat', '123', [{"resource": "whatsapp", "path":"+79214420927"}]);
  subscriptionStorage.add({camps: [{
      campId: 232449,
      dates: ['2020-05-29','2020-05-30'],
    }, {
      campId: 232450,
      dates: ['2020-05-29','2020-05-30'],
    }, {
      campId: 232447,
      dates: ['2020-05-29','2020-05-30'],
    }], userId: usersDB.keys().next().value});
  const availabilityChecker = new AvailabilityChecker();
  WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger is working!');
});

module.exports = app;
