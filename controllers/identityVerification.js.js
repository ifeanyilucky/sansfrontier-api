const Identity = require('../models/identityVerification.js');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/bad-request.js');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const config = require('../config');
const sendEmail = require('../utils/sendEmail');

const verifyIdentity = async (req, res) => {
  const { email, firstName, lastName, country, state, zipCode } = req.body;
  const identity = await Identity.create({
    ...req.body,
    user: req.user.userId,
  });
  const verificationRequestMsg = `
  <div>
  <h4>
  ${firstName} wants to verify their identity on Lemox
  </h4>
  <p>
  to view and verify their identity, click on the link below
  </p>
  <p>
  <a href="${config.website}/admin/users/${req.user.userId}" target="_blank">
  ${config.website}/admin/users/${req.user.userId}</a>
  </p>
  </div>
  `;
  await sendEmail({
    from: `<support@lemox.iom>`,
    to: 'support@lemox.io',
    subject: `${firstName} ${lastName} wants to verify identity`,
    text: verificationRequestMsg,
  });
  res.status(StatusCodes.CREATED).json(identity);
};

const updateVerification = async (req, res) => {
  const id = req.params;
  const { firstName, lastName, zipCode, state, country, email } = req.body;
  const identity = await Identity.findByIdAndUpdate(
    mongoose.Types.ObjectId(id),
    req.body,
    {
      new: true,
    }
  );
  if (!identity) {
    throw new BadRequestError('Identity not found');
  }

  ejs.renderFile(
    path.join(__dirname, '../views/email/id-verification-success.ejs'),
    { config, title: 'Your ID is successful' },
    async (err, data) => {
      if (err) {
        console.log(err);
      } else {
        await sendEmail({
          from: config.email.supportEmbed,
          to: email,
          subject: 'Your ID is successful',
          text: data,
        });
      }
    }
  );

  res.status(StatusCodes.OK).json(identity);
};

const getAllIdentity = async (req, res) => {
  const identity = await Identity.find();
  res.status(StatusCodes.OK).json(identity);
};

const getSingleIdentity = async (req, res) => {
  const { id } = req.params;
  const identity = await Identity.findById(id);
  res.status(StatusCodes.OK).json(identity);
};

module.exports = {
  verifyIdentity,
  getAllIdentity,
  getSingleIdentity,
  updateVerification,
};
