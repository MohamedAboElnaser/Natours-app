/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const filtrObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
/**
  to upload images we use multer which is a middleware for handelling
  multi-part form data 
*/
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extention = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'The uploaded file is not an image,Please upload only image',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserImage = catchAsync(async(req, res, next) => {
  if (!req.file) return next();
  const fileName = `user-${req.user.id}.jpeg`;
  req.file.filename = fileName;
 await  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${fileName}`);

  next();
});

exports.getMe = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    User: req.user,
  });
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log('req.file:', req.file);
  // console.log('req.body', req.body);
  // 1] throw error i the user provides  password with the req
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'If you want to reset your password pleae go to /updateMyPassword',
        400
      )
    );

  // 2] filter out the unwanted fields that are not allowed to updated
  const filterObj = filtrObject(req.body, 'name', 'email');
  if (req.file) filterObj.photo = req.file.filename;

  //3] update user's document in the database
  const user = await User.findByIdAndUpdate(req.user.id, filterObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser: user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { Active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.creatUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This rout is not defiend,Use this rout instead /signUp',
  });
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// we do not update User's password using this handeller
// insted we use resetPassword from authController file
exports.updatUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
