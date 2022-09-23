const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../model/userModel');

// const users = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, err => {
//         console.log(err);
//     })
// );

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
