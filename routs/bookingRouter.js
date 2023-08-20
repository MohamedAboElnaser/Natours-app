const express = require('express');
const authController = require('./../controllers/authController');
// const reviewRouter = require('./reviewRouter');
const bookingController=require('./../controllers/bookingController');

const router = express.Router();


router.use(authController.protect);

router.route('/checkout-session/:tourId').get(bookingController.getCheckoutSession)



module.exports=router;