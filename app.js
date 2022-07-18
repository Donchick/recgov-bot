var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const AvailabilityChecker = require('./controller/availabilityChecker');
const redis = require("redis");
const {promisifyAll} = require('bluebird');
const client = redis.createClient({url: process.env.REDIS_URL});

var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
const {addUser} = require('./storage/userStorage');
const subscriptionStorage = require('./storage/subscriptionStorage');
const WhatsAppNotifier = require('./api/whatsappClient');
const PORT = process.env.PORT || 3001;

promisifyAll(redis);
client.on('error', (err) => console.log('Redis Client Error', err));

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', apiRouter);
app.use('/api/auth', authRouter);
app.post('/status', (req, res) => {
    WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger is working!');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        type: err.type,
        errors: err.errors
    });
});

app.listen(PORT, async () => {
    console.log("Server started!");
    const camps = await client.lrangeAsync("campRequests", 0, Number.MAX_SAFE_INTEGER)
        .then(
            (stringifiedCampsArray) => stringifiedCampsArray.map(
                (stringifiedCamp) => JSON.parse(stringifiedCamp)));

    console.log(camps);
    addUser('irina', '123', [{"resource": "whatsapp", "path": "+79119001155"}]);
    const usersDB = addUser('donat', '123', [{"resource": "whatsapp", "path": "+79214420927"}]);
    // addUser('artem', '1234', [{"resource": "whatsapp", "path":"+16504476199"}]);
    for ([key] of usersDB.entries()) {
        subscriptionStorage.add({camps, userId: key});
    }
    const availabilityChecker = new AvailabilityChecker();
    WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger has started!');
    setInterval(() => {
        WhatsAppNotifier.notify('+79214420927', 'Boss, advanced pinger is working!');
        console.log('Boss, I\'m working. Message was sent.');
    }, 60 * 60 * 12 * 1000);
    setInterval(() => {
        WhatsAppNotifier.notify('+79214420927', 'Boss, send me a message to keep conversation alive!');
        console.log('Boss, I\'m working. Message to keep conversation alive was sent.');
    }, 60 * 60 * 23 * 1000);
});

module.exports = app;