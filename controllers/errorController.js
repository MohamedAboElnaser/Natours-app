/* eslint-disable node/no-unsupported-features/es-syntax */
const AppErorr = require('./../utils/appError');

const handelCastErrorDB = (err) => {
  const message = `Invalide ${err.path}: ${err.value}`;
  return new AppErorr(message, 400);
};
const handelDoplicateFieldsDB = (err) => {
  const value = err.errmsg
    .match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    .replaceAll('"', '');
  const message = `Duplicate field Value : ${value}`;
  return new AppErorr(message, 400);
};
const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors).map((el) => el.message);
  return new AppErorr(message.join('. '), 400);
};

const handleJwtError = () =>
  new AppErorr('Invalid token. Please log again', 401);

const handleExpiredJWT = () =>
  new AppErorr(
    'Your token has expired,Pleas login again to access the routs',
    401
  );
const sendErrDevel = (err, res, req) => {
  //1]This response go to API client
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      errStack: err.stack,
    });
  }
  //2]This to REDERED website
  return res.status(err.statusCode).render('error', {
    title: 'Error happend!',
    msg: err.message,
  });
};

const sendErrProd = (err, req, res) => {
  //A]Api response
  if (req.originalUrl.startsWith('/api')) {
    //operational errors that are trusted, send it to the client
    if (err.isOperational) {
      // 1] we log that error
      console.error(err);

      // 2] we send simple error message to the client
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //programming errors [come from 3rd part library may be] we do not send them to the client
    console.error('Error', err);
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!!!!!',
    });
  }

  //B]Rendered Website
  //operational errors that are trusted, send it to the client
  if (err.isOperational) {
    // 1] we log that error
    console.error(err);

    // 2] we render simple error message to the client
    return res.status(err.statusCode).render('error', {
      title: 'Error happend!',
      msg: err.message,
    });
  }
  //programming errors [come from 3rd part library may be] we do not send them to the client
  console.error('Error', err);
  return res.status(500).render('error',{
    title: 'Something went Wrong',
    message: 'Try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrDevel(err, res, req);
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, errmsg: err.message };
    error.message=err.message;
    //here we check err.name not error.name as name properity is in the prototype chain of err
    // and we lose this chain after this line let error={...err}
    if (err.name === 'CastError') error = handelCastErrorDB(error);
    if (err.code === 11000) error = handelDoplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJwtError(error);
    if (err.name === 'TokenExpiredError') error = handleExpiredJWT(error);
    sendErrProd(error, req, res);
  }
};
