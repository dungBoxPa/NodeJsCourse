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
            message: err.message
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

module.exports = ((err, req, res, next) => {
    console.log(err);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        sendErrorProduction(error, res);
    }
});