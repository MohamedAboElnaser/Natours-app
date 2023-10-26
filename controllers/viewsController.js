const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');

const csp =
  "connect-src 'self'  http://127.0.0.1:8000 https://cdnjs.cloudflare.com ws://localhost:36180;";
exports.getOverview = catchAsync(async (req, res) => {
  //1) get all the tours from the DB
  const tours = await Tour.find();
  //2)build the template

  //3)send the rendered template to the client
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com ws://localhost:36180;"
    )
    .render('overview', {
      title: 'OverViewPage',
      tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1] get the data related to the required tour
  const tour = await Tour.findOne({ slug: req.params.tourSlug }).populate(
    'guides reviews'
  );

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  // 2] build the template
  // 3] render the data received from the step1
  res.status(200).set('Content-Security-Policy', csp).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.loginForm = (req, res, next) => {
  res.status(200).set('Content-Security-Policy', csp).render('login', {
    title: 'Log into Your account',
  });
};

exports.getUserAccount = (req, res) => {
  res.status(200).set('Content-Security-Policy', csp).render('account', {
    title: 'Your Account',
    user: res.locals.user,
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1] get bookings related to this user
  const bookings = await Booking.find({ user: req.user.id });

  //2] get all tours with the related id
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).set('Content-Security-Policy', csp).render('overview', {
    title: 'My Tours',
    tours,
  });
});
