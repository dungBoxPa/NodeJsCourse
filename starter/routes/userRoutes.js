const express = require('express');
const userController = require('./../controllers/tourController');
// const {getAllUsers, createUser, getUser, updateUser, deleteUser} = require('./../controllers/tourController');
const app = express();


const router = express.Router();

router.route('/')
    .get(userController.getAllTours)
    .post(userController.createTour);

router.route('/:id')
    .get(userController.getTour)
    .patch(userController.updateTour)
    .delete(userController.deleteTour);


module.exports = router;