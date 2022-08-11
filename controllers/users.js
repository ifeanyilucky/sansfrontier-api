const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');

const getUsers = async (req, res) => {
  const users = await User.find({ role: 'investor' })
    .select('-passwordResetToken -passwordResetExpire')
    .sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json(users);
};

const getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('User not found');
  res.status(StatusCodes.OK).json(user);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOneAndRemove({ _id: id });
  if (!user) throw new NotFoundError('User not found');
  res.status(StatusCodes.OK).json(user);
};

module.exports = { getUser, getUsers, deleteUser };
