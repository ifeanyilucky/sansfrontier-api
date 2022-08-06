const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const InvestmentSchema = new Schema({
  charge: {
    type: Object,
    required: [true, 'Please provide charge'],
  },
  chargeCode: {
    type: String,
    required: [true, 'Charge Code not found'],
  },
  ethToken: {
    type: String,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    default: 3000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  incrementedAt: {
    type: Date,
    default: Date.now,
  },
  incrementAmount: {
    type: Number,
    default: 0,
  },
  user: {
    type: Schema.Types.ObjectId,
    require: [true, 'Please provide investor'],
    ref: 'User',
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
  },
  chargeId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'success'],
    default: 'pending',
  },
  topUpInterval: {
    type: String,
  },
  duration: {
    type: String,
    enum: ['Monthly', 'Weekly', 'Daily', 'Hourly', 'Every 30 Minutes'],
    default: 'Monthly',
  },
  minimumRoi: {
    type: Number,
  },
  minimumReturn: {
    type: Number,
  },
  expectedIncome: {
    type: Number,
    default: 10,
  },
});

module.exports = mongoose.model('Investment', InvestmentSchema);
