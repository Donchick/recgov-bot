var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const AvailabilityChecker = require('./controller/availabilityChecker');

var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');
const {addUser} = require('./storage/userStorage');
const subscriptionStorage = require('./storage/subscriptionStorage');
const WhatsAppNotifier = require('./api/whatsappClient');
const DbClient = require("./storage/dbClient");
const PORT = process.env.PORT || 3001;

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'my-app/build'), {
    etag: false, lastModified: false, setHeaders: (res, path) => {
        // No cache for index html otherwhise there's gonna be problems loading the scripts
        if (path.indexOf('index.html') !== -1) {
            res.set('Cache-Control', 'no-store')
        }
    }
}));

app.use('/api/', apiRouter);
app.use('/api/auth', authRouter);
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'my-app/build') + '/index.html',
        {etag: false, lastModified: false});
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
    const camps = await (new DbClient()).getCampingSubscriptions();

    console.log(camps);
    addUser('irina', '123', [{"resource": "whatsapp", "path": "+79119001155"}]);
    const usersDB = addUser('donat', '123', [{"resource": "whatsapp", "path": "+79214420927"}]);
    // addUser('andrey', '1234', [{"resource": "whatsapp", "path": "+79313689455"}]);
    for ([key] of usersDB.entries()) {
        subscriptionStorage.add({camps, userId: key});
    }
    (new AvailabilityChecker()).startCheck();
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