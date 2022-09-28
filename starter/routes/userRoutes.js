const express = require('express');
const ExpressBrute = require('express-brute');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
var moment = require('moment');

const app = express();

var failCallback = function (req, res, next, nextValidRequestDate) {
    req.flash('error', "You've made too many failed attempts in a short period of time, please try again " + moment(nextValidRequestDate).fromNow());
    res.redirect('/login'); // brute force protection triggered, send them back to the login page
};

var handleStoreError = function (error) {
    log.error(error); // log this error so we can figure out what went wrong
    // cause node to exit, hopefully restarting the process fixes the problem
    throw {
        message: error.message,
        parent: error.parent
    };
}

const store = new ExpressBrute.MemoryStore();

const userBruteforce = new ExpressBrute(store, {
    freeRetries: 5,
    minWait: 10000,
    maxWait: 60 * 1000,
    failCallback: failCallback,
    handleStoreError: handleStoreError
});

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', userBruteforce.getMiddleware({
    key: function (req, res, next) {
        // prevent too many attempts for the same username
        next(req.body.email);
    }
}), authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.patch('/deleteMe', authController.protect, userController.deleteMe);


router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        userController.deleteUser);


module.exports = router;