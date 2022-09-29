const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
    );
}

const CookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
};
if (process.env.NODE_ENV === 'production') {
    CookieOptions.secure = true;
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.cookie('jwt', token, CookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
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

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1 : Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with that email address', 404));
    }
    console.log(user);

    // 2: Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });
    console.log(resetToken);

    // 3: Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}
    .\n if you did not forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid in 10 minutes)',
            message
        });
        console.log('Email sent');
        return res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        console.log(err);
        return next(new AppError('There was an error sending the email. Try again later!'));
    }


});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1: get user based on the token 
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne(
        {
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }
    );
    // 2: If the token has not expired, and there is a user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired!', 400));
    }

    // 3: Update changedPassword property for the user 
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 4: Log the user in, send JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1: Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2: Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }
    console.log(user);

    // 3: If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();
    // => findByIdAndUpdate will not work here since it will ignore middlewares which are passwordEncryption and set PasswordChangeAt 
    // 4: Log user in, send JWT
    createSendToken(user, 200, res);
});