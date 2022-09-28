const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
// const users = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, err => {
//         console.log(err);
//     })
// );

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    console.log('Get all users');
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
});

const genRand = (len) => {
    return Math.random().toString(36).substring(2, len + 2);
}

exports.createUser = (req, res) => {
    console.log('Create new user: ');
    const _id = genRand(8);
    const newUser = Object.assign({ _id }, req.body);
    users.push(newUser);
    fs.writeFile(`${__dirname}/../starter/dev-data/data/users.json`,
        JSON.stringify(users),
        err => {
            if (err) console.log(err);
            res.status(200).json({
                status: 'success',
                data: {
                    user: newUser
                }
            })
        });

};

exports.getUser = catchAsync(async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    console.log(user);
    res.status(200).json({
        status: 'success',
        data: user
    })
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1: Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }
    // 2: Filter unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    // 3: Update user docs
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: user
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});
    res.status(200).json({
        status: 'success',
        data: null
    });
})

exports.updateUser = catchAsync(async (req, res) => {
    const user_id = req.params.id;
    const update_user = await User.findByIdAndUpdate({ user_id });
    console.log(update_user);
    res.status(404).json({
        status: 'failed',
        message: 'This feature has not been update!'
    })
});

exports.deleteUser = (req, res) => {
    res.status(404).json({
        status: 'failed',
        message: 'This feature has not been update!'
    })
}
