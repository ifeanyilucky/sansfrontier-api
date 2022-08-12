const mongoose = require('mongoose');

const IdentityVerification = new mongoose.Schema(
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
    city: {
      type: String,
    },
    street: String,
    zipCode: String,
    idType: String,
    idImage: String,
    selfie: String,
    idCountry: String,
    dateOfBirth: {
      type: String,
      required: [true, 'Please provide your date of birth'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    identityEmaiL: String,
    tel: {
      type: String,
      minLength: 9,
      maxLength: 11,
      trim: true,
      required: [true, 'Please provide phone number'],
    },
    verified: {
      type: String,
      enum: ['true', 'false'],
      default: 'false',
      required: [true, 'Please provide verification status'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('idVerification', IdentityVerification);
