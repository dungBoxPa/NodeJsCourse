const express = require('express');
const morgan = require('morgan');

const tourRouter = require(`./starter/routes/tourRoutes`);
const userRouter = require(`./starter/routes/userRoutes`);
const AppError = require('./starter/utils/appError');
const errorController = require('./starter/controllers/errorController'); 

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 1: Middleware


app.use(express.json());
app.use(express.static(`${__dirname}/starter/public`))

// app.use((req, res, next) => {
//     console.log('Hello from the middleware');
//     next();
// });

// 2: Route handlers 

//= app.get('/api/v1/tours', getAllTours);
// app.get(`/api/v1/tours/:id`, getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// app.post('/api/v1/tours', createTour);


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

