const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requried: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must be less than or equal to 40 chars'],
      minlength: [10, 'Tour name must be more than or equal to 10 chars'],
      // validate: [
      //   validator.isAlpha,
      //   'The name of tour must contains only chars',
      // ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy ,medium or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be more tahn or equal to 1'],
      max: [5, 'Rating must be less tahn or equal to 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      //here the validator only  works on save
      validate: {
        validator: function (val) {
          //her this only points to the new created doc
          return val < this.price;
        },
        message: 'priceDisconunt ({VALUE}) must be less than the price:((',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a discription'],
    },
    slug: String,

    discription: {
      type: String,
      trim: true,
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must had an image Cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],

    startLocation: {
      //Geojson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  //options object
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

//creating a compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('getDurationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});
//Document Middlewares
//this middleware runs before .save() .create() not for update
tourSchema.pre('save', function (next) {
  //this here points to the current document
  this.slug = slugify(this.name, { lower: true });
  next();
});
//this middleware is responsible for embedding the data of the guides into our tour document
//but this approach is not the perfect as if the guide update his data i have to update his
//data in both His standalone document and it the tour documents that he is envolved in

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (id) => await User.findById(id).exec()
//   );
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

//this middlewares runs after .save() .create()
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//Quary Middleware
// this middleware will be triggered before any find query or simillar to find query is
//fired up
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //this here points to the query object
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  //here this points to the current query object
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
// tourSchema.post(/^find/, function (doc, next) {
//   //this here has access to the query object
//   console.log(`the query took ${Date.now() - this.start} ms`);
//   next();
// });

// Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   //this here points to the aggregation obj
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//creating the model
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
