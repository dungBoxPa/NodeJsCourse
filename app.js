const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require(`./starter/routes/tourRoutes`);
const userRouter = require(`./starter/routes/userRoutes`);
const AppError = require('./starter/utils/appError');
const errorController = require('./starter/controllers/errorController');

const app = express();

// 1: GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP. Try again in an hour!'
})

// limit access to the api route
app.use('/api', limiter);

// Body Parser, reading data from the body into req.body
app.use(express.json({
    limit: '10kb'
}));

// Data Sanitization against NoSQL query injection
// app.use(expressSanitize());
// Data Sanitization against XSS
app.use(xss());
// Prevent params pollution
app.use(hpp({
    whitelist: [
        'duration'
    ]
}));
// Serving static files
app.use(express.static(`${__dirname}/starter/public`));

app.use((req, res, next) => {
    console.log('This is the middleware');
    next();
});

// 3: Routes
/*
 => move Route handler to 'routes' file
*/

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can not find ${req.originalUrl} on this server`, 404));
});

app.use(errorController);

module.exports = app;

