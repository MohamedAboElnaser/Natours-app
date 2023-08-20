const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();
// router.param('id', (req, res, next, val) => {
//   console.log(`User id : ${val}`);
//   next(); //to give the control to the
//   // next middleware in the middlware stack;
// });

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Authenticate all the comming routes
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserImage,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//authorizations (Permissions) restricted to the admin
//make the comming middlewares Restricted  to the admin
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.creatUser); //this handeller is useless as /singUp do the job
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updatUser)
  .delete(userController.deleteUser);

module.exports = router;
