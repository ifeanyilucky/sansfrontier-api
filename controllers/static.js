const InvestModel = require('../models/investment');
const withdrawal = require('../models/withdrawal');
const properties = require('../models/properties');
const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, BadRequestError } = require('../errors');

const getStaticInvestments = async (req, res) => {
  const investments = await InvestModel.find()
    .sort({ createdAt: -1 })
    .populate('property')
    .populate('user');
  res.status(StatusCodes.OK).json(investments);
};

const getStaticWithdrawal = async (req, res) => {
  const withdrawals = await withdrawal
    .find({})
    .sort({ createdAt: -1 })
    .populate('user');
  res.status(StatusCodes.OK).json(withdrawals);
};

const updateEarning = async (req, res) => {
  const { id } = req.params;
  const { incrementAmount } = req.body;
  const earning = await InvestModel.findOneAndUpdate(
    { _id: id },
    { incrementAmount: incrementAmount },
    { new: true }
  );
  res.status(StatusCodes.ACCEPTED).json(earning);
};
module.exports = { getStaticInvestments, getStaticWithdrawal, updateEarning };
