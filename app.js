const express = require('express');
const morgan = require('morgan');

const tourRouter = require(`./starter/routes/tourRoutes`);
const userRouter = require(`./starter/routes/userRoutes`);
const AppError = require('./starter/utils/appError');
const errorController = require('./starter/controllers/errorController');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};


app.use(express.json());
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

