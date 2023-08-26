const express = require('express');
const authController = require('./../controllers/authController');
// const reviewRouter = require('./reviewRouter');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/checkout-session/:tourId')
  .get(bookingController.getCheckoutSession);

// The below routes authorized to admin and lead-guide only
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
  
module.exports = router;
