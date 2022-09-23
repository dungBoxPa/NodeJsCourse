const AppError = require('./../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProduction = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            name: err.name
        });
        // Programming or other unknown error: dont leak error details
    } else {
        // 1: Log error
        // console.log(err);
        // 2: Send general message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(err.keyValue);

    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid Token. Please log in again !',  401);

const handleJWTExpired = () => new AppError('Your token has expired! Please login again!',  401);
 
module.exports = ((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = Object.assign(err);
        console.log(error.name);
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') {
            console.log(1234);
            error = handleValidationErrorDB(error);
        }
        if(err.name === 'JsonWebTokenError') error = handleJWTError(error);
        if(err.name === 'TokenExpiredError') error = handleJWTExpired(error);

        sendErrorProduction(error, res);
    }
});