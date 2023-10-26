const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKI_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  // 1] get newUser data from body request
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // 2] send welcome email to the user
  const url=`${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser,url).sendWelcome();

  //   createSendToken(newUser, 201, res); this cause data leak:(
  // 3] send back the token to the client
  const token = signToken(newUser._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKI_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  newUser.password = undefined;
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  // 1] get pass and email
  const { password, email } = req.body;

  //2]check the existence of pass and email
  if (!password || !email) {
    return next(new AppError('Pleas enter a password and email', 400));
  }

  //3]check if the user exist and the password is right
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid username or password', 401));
  }

  //4] send the token back to the client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'pla pla pla..', {
    expires: new Date(Date.now() + 15 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1]getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;
  if (!token)
    return next(
      new AppError('you are not logged in! Please log in to get access', 401)
    );

  // 2]Verification token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // console.log(decodedToken);

  //3] check if User still exist  [this step is important in case any person could in any way to get someone else token
  // so we check first if the user still exist or reset his account or any thing]
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser)
    next(
      new AppError(
        'The user belonging to this token is no longer existing.',
        401
      )
    );

  //4]if the User changed password after the token was issued
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User recently changed the password.Please, login again'),
      401
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  // console.log('currentUser form the protect :', currentUser);
  //Her we give the access to the protected rout ')
  next();
});

// just to check if the user is logged in and there is no any error
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1]Verification token
      const decodedToken = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decodedToken);

      //2] check if User still exist  [this step is important in case any person could in any way to get someone else token
      // so we check first if the user still exist or reset his account or any thing]
      const currentUser = await User.findById(decodedToken.id);
      if (!currentUser) return next();

      //3]if the User changed password after the cookie was issued
      if (currentUser.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }
      // this means there is already logdIn user so I set this user to locals property of response object
      // to have access to it in pug template
      res.locals.user = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //here we have access to roles because of closure
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1] get user based on Posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email Address', 404));

  // 2] Generate radome token
  const resetToken = user.createPasswordResetToken(); //this method change the content of the user doc
  await user.save({ validateBeforeSave: false });

  //3] send the  token to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
    });
  } catch (err) {
    //reset the user passwordResetToken and passwordResetExpires properties
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There were an error sending the email.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1] get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2] If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3] Update passwordChangedAt property for the user -->done using the pre middleware function

  //4]log the user in,send jwt back to the client
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //   1]Get user from collection
  //here we have the access to user property of the req from the protect middleware
  const user = await User.findOne({ _id: req.user._id }).select('+password');
  // console.log('user from update password:', user);
  //   2]check if Posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(
      new AppError('Your current password is wrong ,pleas try again', 401)
    );

  //   3]If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //   4]Log user in, send the jwt back to the client
  createSendToken(user, 200, res);
});
