/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'pleas enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Enter your email'],
    unique: true,
    lowecase: true,
    validate: [validator.isEmail, 'Pleas ,Enter a valid Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Pleas,Enter passWord'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, Confirm Your password.'],
    //this validator works only on save and create new document and don't work wih update:(
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same😡',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  paswordResetExpires: Date,
  Active: {
    type: Boolean,
    default: true,
    select: false,
  },
});
//model middleware

userSchema.pre('save', async function (next) {
  // the function only works if the password is modified
  if (!this.isModified('password')) return next;
  //hash the password
  this.password = await bcrypt.hash(this.password, 10);

  //delete the passwordConfirmed field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = this.passwordChangedAt.getTime() / 1000;

    // console.log(changedTimeStamp, JWTTimestamp);
    return changedTimeStamp > JWTTimestamp;
  }
  //false means ther is no change in the password after the jwt issued
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.paswordResetExpires = Date.now() + 10 * 60 * 1000; //this token valid for only 10 minuts
  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  this.find({ Active: { $ne: false } });
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
