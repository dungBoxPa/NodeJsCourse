const express = require('express');
const ExpressBrute = require('express-brute');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const expressSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

var failCallback = function (req, res, next, nextValidRequestDate) {
    res.status(200).json({
        status: 'success',
        message: `Too many attemps to login. Please wait 10s to login again!`
    });
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
router.post('/login', authController.login);

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