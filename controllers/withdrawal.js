const withdrawal = require('../models/withdrawal');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');
const sendEmail = require('../utils/sendEmail');
const ejs = require('ejs');
const path = require('path');
const config = require('../config');
const { format } = require('date-fns');
const moment = require('moment');

const withdrawFunds = async (req, res) => {
  const { email } = req.user;
  const { btcWalletAddress, amount } = req.body;
  const withdraw = await withdrawal.create({
    ...req.body,
    user: req.user.userId,
  });
  res.status(StatusCodes.CREATED).json(withdraw);

  const withdrawMsg = `
  <div>
    <h6>User with this email:<strong> ${email}</strong> has requested a withdrawal on their Lemox account</h6>
    <p>Amount: ${amount}</p>
    <p>BTC Wallet Address: ${btcWalletAddress} </p>
  </div>
  
  `;
  await sendEmail({
    from: `Lemox Team <support@lemox.io>`,
    to: 'support@lemox.io',
    subject: 'Lemox user is requesting for withdrawal!',
    text: withdrawMsg,
  });
};

const getAllWithdrawal = async (req, res) => {
  const withdraw = await withdrawal.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json(withdraw);
};

const getSingleWithdrawal = async (req, res) => {
  const { id } = req.params;
  const withdraw = await withdrawal.findById(id);
  res.status(StatusCodes.OK).json(withdraw);
};

const processWithdrawal = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    btcWalletAddress,
    amount,
    firstName,
    lastName,
    email,
    refId,
    date,
  } = req.body;

  const processedWithdrawal = await withdrawal.findOneAndUpdate(
    { _id: id },
    { status: 'complete' },
    { new: true }
  );
  if (!processedWithdrawal) throw new NotFoundError('Withdrawal not found');
  const fAmount = Number(amount).toLocaleString();
  const fDate = moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a');
  console.log(fDate);
  ejs.renderFile(
    path.join(__dirname, '../views/email/withdrawal-success.ejs'),
    {
      config,
      amount: `$ ${fAmount}`,
      btcWalletAddress,
      firstName,
      refId,
      date: fDate,
      lastName,
      title: `Thank you for trusting us`,
    },
    async (err, data) => {
      if (err) {
        console.log(err);
      } else {
        await sendEmail({
          from: 'Lemox Support <support@lemox.io',
          to: email,
          subject: `Your withdrawal request of $ ${fAmount} has been sent to your BTC address`,
          text: data,
        });
      }
    }
  );

  res.status(StatusCodes.ACCEPTED).json(processedWithdrawal);
};

const cancelWithdrawal = async (req, res) => {
  const { id } = req.params;

  const data = await withdrawal.findOneAndRemove({ _id: id });
  res.status(StatusCodes.ACCEPTED).json(data);
};
module.exports = {
  withdrawFunds,
  getAllWithdrawal,
  getSingleWithdrawal,
  processWithdrawal,
  cancelWithdrawal,
};
