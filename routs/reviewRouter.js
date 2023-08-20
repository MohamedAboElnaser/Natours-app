const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//this mergeParams enable the router to access the params of the parent router in this case [tourId] paramerter
// from '/tours/:tourId/reviews' router
const router = express.Router({ mergeParams: true });

//Authentication
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllreviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.creatReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );
module.exports = router;
