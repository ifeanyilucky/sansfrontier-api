const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authentication');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  editProfile,
  changePassword,
  verifyAccount,
  getAccount,
  getAllIdentity,
  getSingleIdentity,
} = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/profile/:id').patch(editProfile);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').patch(resetPassword);
router.route('/password/:id').patch(changePassword);
router.route('/verify-email/:token').patch(verifyAccount);
router.route('/account/:id').get(getAccount);
router.route('/userid').get(getAllIdentity);
router.route('/userid/:id').get(getSingleIdentity);
module.exports = router;
