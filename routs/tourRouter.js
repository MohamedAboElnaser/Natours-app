const express = require('express');
const authController = require('./../controllers/authController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();
const tourController = require('../controllers/tourController');

// router.param('id', tourController.checkId);
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getTorDistances);

router
  .route('/top-5-tours')
  .get(tourController.aliasTop5tours, tourController.getAllTours);
router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/monthly-plane/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.creatTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhotos,
    tourController.resizeTourPhotos,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// Post  api/v1/tours/tourId/reviwes
// GET  api/v1/tours/tourId/reviwes
// GET  api/v1/tours/tourId/reviwes/asdf443u

module.exports = router;
