const Identity = require('../models/identityVerification.js');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/bad-request.js');
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const sendEmail = require('../utils/sendEmail');
const { uploads } = require('../utils/cloudinary');

const verifyIdentity = async (req, res) => {
  const identity = JSON.parse(req.body.identity);
  const {
    email,
    firstName,
    lastName,
    country,
    state,
    zipCode,
    userId,
    idType,
  } = identity;
  const { files } = req;

  const images = JSON.parse(JSON.stringify(files));
  const idImage = images.idImage[0];
  const selfie = images.selfie[0];

  const selfieUrl = await uploads(selfie.path, 'selfie');
  const idImageUrl = await uploads(idImage.path, 'idImage');

  fs.unlinkSync(selfie.path);
  fs.unlinkSync(idImage.path);

  const addIdentity = await Identity.create({
    ...identity,
    user: req.user.userId,
    selfie: selfieUrl,
    idImage: idImageUrl,
  });
  const verificationRequestMsg = `
  <div>
  <p>
  ${firstName} wants to verify their identity on Sansfrontier
  </p>
  <p>
  to view and verify their identity, click on the link below
  </p>
  <p>
  <a href="${config.website}/admin/users/${req.user.userId}" target="_blank">
  ${config.website}/admin/users/${userId}</a>
  </p>
  </div>
  `;
  await sendEmail({
    from: `<sansfrontierdhc@outlook.com>`,
    to: 'sansfrontierdhc@outlook.com',
    subject: `${firstName} ${lastName} wants to verify identity`,
    text: verificationRequestMsg,
  });
  res.status(StatusCodes.CREATED).json(addIdentity);
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
          from: `Sansfrontier Support <${config.email.support}>`,
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
