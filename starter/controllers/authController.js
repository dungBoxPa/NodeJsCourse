const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');


const signToken = (id, name) => {
    return jwt.sign(
        { id: id, name: name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
    );
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id, newUser.name);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            newUser
        }
    });

});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1: Check email, password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    // 2: Check user exist & pw is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect password or email', 401));
    }
    console.log(user);
    // 3: If ok => send token to user
    const token = signToken(user._id, user.name);
    res.status((200)).json({
        status: 'success',
        token
    })
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1: Getting token and check
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('You are not logged in!', 401));
    }
    // 2: Verification token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('JWT token issued at: ', decoded.iat);
    // 3: Check if user still exist
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belong to this token does no longer exist!', 401));
    }
    // 4: Check if user change password after the jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }
    // : Grant access to Protected route
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Roles is an ARRAY => ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform action', 403));
        }
        next();
    }
};