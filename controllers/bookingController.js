/* eslint-disable import/no-extraneous-dependencies */
const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1] get the current booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2] create checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    client_reference_id: req.params.tourId,
    customer_email: req.user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  });
  // 3] send the session back to the client
  res.status(200).json({
    status: 'success',
    message: 'Session created successfully',
    session,
  });
});

exports.creatBookingCheckout=catchAsync(async(req,res,next)=>{
  const {tour,user,price}=req.params;
  // console.log(req.params);
  // console.log('redirect to :',req.originalUrl.split('?')[0]);
  if(!tour ||  !user ||  !price) return next();

   await Booking.create({tour,user,price}); 
   res.redirect(req.originalUrl.split('?')[0]);
});


exports.createBooking = factory.creatOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
