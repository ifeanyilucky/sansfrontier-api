const withdrawal = require('../models/withdrawal');
const { StatusCodes } = require('http-status-codes');
const sendEmail = require('../utils/sendEmail');

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

module.exports = {
  withdrawFunds,
  getAllWithdrawal,
  getSingleWithdrawal,
};
