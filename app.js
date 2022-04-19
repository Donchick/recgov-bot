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
const PORT = process.env.PORT || 3001;

const camps = [{
  campId: 232447,
  dates: ['2022-05-27', '2022-05-28'],
}, {
  campId: 232447,
  dates: ['2022-05-28', '2022-05-29'],
}, {
  campId: 232447,
  dates: ['2022-06-03', '2022-06-04'],
}, {
  campId: 232447,
  dates: ['2022-06-10', '2022-06-11'],
}, {
  campId: 232447,
  dates: ['2022-06-17', '2022-06-18'],
}, {
  campId: 232447,
  dates: ['2022-07-01', '2022-07-02'],
}, {
  campId: 232447,
  dates: ['2022-07-02', '2022-07-03'],
}, {
  campId: 232447,
  dates: ['2022-07-03', '2022-07-04'],
}, {
  campId: 232450,
  dates: ['2022-05-27', '2022-05-28'],
}, {
  campId: 232450,
  dates: ['2022-05-28', '2022-05-29'],
}, {
  campId: 232450,
  dates: ['2022-06-03', '2022-06-04'],
}, {
  campId: 232450,
  dates: ['2022-06-10', '2022-06-11'],
}, {
  campId: 232450,
  dates: ['2022-06-17', '2022-06-18'],
}, {
  campId: 232450,
  dates: ['2022-07-01', '2022-07-02'],
}, {
  campId: 232450,
  dates: ['2022-07-02', '2022-07-03'],
}, {
  campId: 232450,
  dates: ['2022-07-03', '2022-07-04'],
}, {
  campId: 232449,
  dates: ['2022-05-27', '2022-05-28'],
}, {
  campId: 232449,
  dates: ['2022-05-28', '2022-05-29'],
}, {
  campId: 232449,
  dates: ['2022-06-03', '2022-06-04'],
}, {
  campId: 232449,
  dates: ['2022-06-10', '2022-06-11'],
}, {
  campId: 232449,
  dates: ['2022-06-17', '2022-06-18'],
}, {
  campId: 232449,
  dates: ['2022-07-01', '2022-07-02'],
}, {
  campId: 232449,
  dates: ['2022-07-02', '2022-07-03'],
}, {
  campId: 232449,
  dates: ['2022-07-03', '2022-07-04'],
}, {
  campId: 232768,
  dates: ['2022-08-05', '2022-08-06'],
}, {
  campId: 232768,
  dates: ['2022-08-06', '2022-08-07'],
}, {
  campId: 232768,
  dates: ['2022-08-12', '2022-08-13'],
}, {
  campId: 232768,
  dates: ['2022-08-13', '2022-08-14'],
}, {
  campId: 232768,
  dates: ['2022-08-19', '2022-08-20'],
}, {
  campId: 232768,
  dates: ['2022-08-20', '2022-08-21'],
}];

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

app.listen(PORT, () => {
  console.log("Server started!");
  addUser('irina', '123', [{"resource": "whatsapp", "path":"+79119001155"}]);
  const usersDB = addUser('donat', '123', [{"resource": "whatsapp", "path":"+79214420927"}]);
  // addUser('artem', '1234', [{"resource": "whatsapp", "path":"+16504476199"}]);
  for([key] of usersDB.entries()) {
      subscriptionStorage.add({camps, userId: key});
  }
  const availabilityChecker = new AvailabilityChecker();
  WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger has started!');
  setInterval(() => {
    WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger is working!');
    console.log('Boss, I\'m working. Message was sent.');
  }, 60*60*12*1000);
  setInterval(() => {
    WhatsAppNotifier.notify('+79214420927', 'Boss, send me a message to keep conversation alive!');
    console.log('Boss, I\'m working. Message to keep conversation alive was sent.');
  }, 60*60*23*1000);
});

module.exports = app;