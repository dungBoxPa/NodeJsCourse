const fs = require('fs');

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, err => {
        console.log(err);
    })
);

exports.getAllUsers = (req, res) => {
    console.log('Get all users');
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
};

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

exports.getUser = (req, res) => {
    const id = req.params.id;

    const user = users.find(el => el._id === id);
    console.log(user);
    if (!user) {
        return res.status(404).json({
            status: 'failed',
            message: 'Invalid Id'
        });
    } else {
        res.status(200).json({
            status: 'success',
            data: user
        })
    }
};

exports.updateUser = (req, res) => {
    res.status(404).json({
        status: 'failed',
        message: 'This feature has not been update!'
    })
}

exports.deleteUser = (req, res) => {
    res.status(404).json({
        status: 'failed',
        message: 'This feature has not been update!'
    })
}