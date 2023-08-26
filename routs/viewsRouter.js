const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/me', authController.protect, viewsController.getUserAccount);
router.get(
  '/my-tours',
  // bookingController.creatBookingCheckout,s
  authController.protect,
  viewsController.getMyTours
);

router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewsController.getTour
);
router.get('/login', authController.isLoggedIn, viewsController.loginForm);

module.exports = router;
