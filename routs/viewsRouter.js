const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.creatBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/me', authController.protect, viewsController.getUserAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get('/login', authController.isLoggedIn, viewsController.loginForm);

module.exports = router;
