/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routs/tourRouter');
const userRouter = require('./routs/userRouter');
const reviewRouter = require('./routs/reviewRouter');
const viewsRouter = require('./routs/viewsRouter');
const bookingRouter = require('./routs/bookingRouter');
const bookingController = require('./controllers/bookingController');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//Body parser middleware to read the body of request and set it to req.body in json format
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//cookie-parser
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// this middleware to serve static files that is not served in the routs
app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//-------------------Global Middlewares-------------------
//set security HTTP headers
app.use(helmet());

//limiting requests from the same IP address
const limiter = rateLimit({
  max: 100,
  windwoMs: 60 * 60 * 1000,
  message:
    'To meany requests from the same IP ,please try again after one hour',
});

app.use('/api', limiter);

//Data Sanitization against Nosql query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());
//creating middleware

//3rd-party middleware [morgan]
// if (process.env.NODE_ENV === 'development')
app.use(morgan('dev'));

// compression middleware compress the body of res[text,html]
app.use(compression());
// set the middleware

// use cors middleware
app.use(cors());

//----->this process is called mounting the router
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//handel unhandled Routs but this middleware must be the last one at
// middleware stack
app.all('*', (req, res, next) => {
  next(new AppError(`Can not response to ${req.originalUrl}`, 404));
});

// Global ERROR handling Middleware
app.use(globalErrorHandler);
module.exports = app;
