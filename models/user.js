const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const shortid = require('shortid');
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxLength: 50,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxLength: 50,
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
    },
    dateOfBirth: {
      type: String,
      required: [true, 'Please provide your date of birth'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    profilePic: {
      type: String,
      default: 'https://avatars.dicebear.com/api/male/avataaars.svg',
    },
    password: {
      type: String,
      minLength: 6,
      required: [true, 'You must provide password'],
    },
    role: {
      type: String,
      enum: ['investor', 'admin', 'affiliate'],
      default: 'investor',
      required: [true, 'Please specify role of user'],
    },
    earnings: {
      type: Number,
      default: 0.0,
    },
    tel: {
      type: String,
      minLength: 10,
      maxLength: 11,
      trim: true,
      required: [true, 'Please provide phone number'],
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    referralCode: {
      type: String,
      default: shortid.generate,
    },
    referredBy: {
      type: String,
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.generateVerificationToken = function () {
  const verificationToken = jwt.sign(
    { userId: this._id },
    process.env.USER_VERIFICATION_TOKEN_SECRET,
    { expiresIn: '2d' }
  );
  return verificationToken;
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = Date.now() + 10 * (1000 * 60);

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
