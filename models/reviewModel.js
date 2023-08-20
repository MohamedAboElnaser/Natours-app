const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review should have a text and not to be null'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belongs to  a T   our'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belongs to a User'],
    },
  },
  //Options object
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// creating an indext to prevent Duplicate reviews for the same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// query middlewares
reviewSchema.pre(/^find/, function (next) {
  //here this points to the current query object
  //   this.populate({
  //     path: 'user',
  //     select: 'name photo',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //this points to the Model created from reviewSchema
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
/**
  ->this.constructor refers to the Model from which we creat the document.
  ->this.tour referes to the tour field of the current review 
  which carrys the tourId of the tour
  which this review belongs to.
 */
// reviewSchema.post('save', function () {
//   this.constructor.calcAverageRatings(this.tour);
// });
reviewSchema.post('save', (doc) => {
  doc.constructor.calcAverageRatings(doc.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  /*
  here this refers to the query object 
  and i attacth the r[review] to the query to access to it in the next middleware in the stack which is [post 'save' hook]
  */
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); Does not work here as the query has already being executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
