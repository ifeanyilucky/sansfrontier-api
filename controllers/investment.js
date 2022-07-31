const InvestModel = require('../models/investment');
const properties = require('../models/properties');
const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');
const coinbase = require('coinbase-commerce-node');
const ejs = require('ejs');
const config = require('../config');
const { NotFoundError, BadRequestError } = require('../errors');
const { Client, Webhook, resources } = require('coinbase-commerce-node');
const { Charge } = resources;
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const moment = require('moment');
const axios = require('axios');
const {
  addDays,
  getMilliseconds,
  milliseconds,
  intervalToDuration,
} = require('date-fns');

Client.init(process.env.COINBASE_API_KEY);

const createInvestment = async (req, res) => {
  const { property, title, amount, ethToken } = req.body;
  const user = await User.findById(req.user.userId);
  let chargeData = {
    name: `${user.firstName} ${user.lastName}`,
    description: title,
    local_price: {
      amount: amount,
      currency: 'USD',
    },
    pricing_type: 'fixed_price',
    metadata: {
      customer_id: req.user.userId,
      customer_name: `${user.firstName} ${user.lastName}`,
      customer_email: user.email,
      customer_first_name: user.firstName,
      property_id: property._id,
      ethToken: ethToken,
    },
  };
  await Charge.create(chargeData, async (err, response) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else {
      res.status(200).send({
        hosted_url: response.hosted_url,
        id: response.id,
        code: response.code,
      });
    }
  });
};

const successInvestment = async (req, res) => {
  const investment = await InvestModel.create(req.body);
  res.status(StatusCodes.CREATED).json(investment);
};

const updateInvestment = async (req, res) => {
  const { id } = req.params;
  const {
    incrementAmount,
    incrementedAt,
    minimumRoi,
    minimumReturn,
    topUpInterval,
    duration,
    title,
    amount,
  } = req.body;
  // update investment amount

  const investment = await InvestModel.findOneAndUpdate(
    { _id: id },
    {
      incrementAmount: incrementAmount,
      minimumRoi,
      minimumReturn,
      topUpInterval,
      duration,
      title,
      amount,
    },
    { new: true }
  );
  if (!investment) {
    throw new NotFoundError('Not found!');
  }

  res.status(StatusCodes.OK).json(investment);
};

const getAllInvestment = async (req, res) => {
  // const investment = await InvestModel.find({}).sort('createdAt');
  const investment = await InvestModel.find({
    user: req.user.userId,
    status: 'success',
  })
    .sort({
      createdAt: -1,
    })
    .populate('property');
  res.status(StatusCodes.OK).json(investment);
};

const getSingleInvestment = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const investment = await InvestModel.findOne({ _id: id }).populate(
    'property'
  );
  if (!investment) {
    throw new NotFoundError('No investment found');
  }
  res.status(StatusCodes.OK).json(investment);
};

const createProperty = async (req, res) => {
  const property = await properties.create(req.body);
  res.status(StatusCodes.CREATED).json(property);
};

const getProperties = async (req, res) => {
  const property = await properties.find({});
  res.status(StatusCodes.OK).json(property);
};

const getSingleProperty = async (req, res) => {
  const { id } = req.params;
  const property = await properties.findById(id);
  if (!property) throw new NotFoundError('No property found!');
  res.status(StatusCodes.OK).json(property);
};

const adminUpdate = async (req, res) => {
  const { id } = req.params;
  const investment = InvestModel.findByIdAndUpdate({ _id: id });

  res.status(StatusCodes.ACCEPTED).json(investment);
};

const paymentHandler = async (req, res) => {
  const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
  const signature = req.headers['x-cc-webhook-signature'];
  const rawBody = req.rawBody;

  try {
    const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
    if (event.type === 'charge:created') {
      console.log('charge created');

      // MOVE THIS CODE TO PENDING EVENT
      const investment = await InvestModel.findOne({
        chargeId: event.data.id,
      });
      if (!investment) {
        const fAmount = event.data.pricing.local.amount.toLocaleString();
        const property = await properties.findById({
          _id: event.data.metadata.property_id,
        });
        await InvestModel.create({
          ...req.body,
          incrementAmount: event.data.pricing.local.amount,
          charge: event.data,
          propertyId: event.data.metadata.property_id,
          property: property,
          ethToken: event.data.metadata.ethToken,
          amount: event.data.pricing.local.amount,
          user: event.data.metadata.customer_id,
          chargeId: event.data.id,
          chargeCode: event.data.code,
          status: 'pending',
        });
      } else {
        console.log(
          'Payment was successful and investment has been added to the database'
        );
      }
    }
    if (event.type === 'charge:pending') {
      console.log('charge pending');

      const investment = await InvestModel.findOne({
        chargeId: event.data.id,
      });
      if (investment) {
        const fAmount = event.data.pricing.local.amount.toLocaleString();

        await InvestModel.create({
          ...req.body,
          incrementAmount: event.data.pricing.local.amount,
          charge: event.data,
          property: event.data.metadata.property,
          ethToken: event.data.metadata.ethToken,
          amount: event.data.pricing.local.amount,
          user: event.data.metadata.customer_id,
          chargeId: event.data.id,
          chargeCode: event.data.code,
          status: 'pending',
        });
      }
    }
    if (event.type === 'charge:confirmed') {
      console.log('charge is confirmed...');

      const investments = await InvestModel.find({
        chargeId: event.data.id,
      });

      const pendingInvestment = investments.find((i) => i.status === 'pending');
      if (pendingInvestment) {
        const fAmount = event.data.pricing.local.amount.toLocaleString();
        ejs.renderFile(
          path.join(__dirname, '../views/email/investment-complete.ejs'),
          {
            config,
            title: 'Investment completed',
            amount: `$ ${fAmount}`,
            firstName: event.data.metadata.customer_first_name,
            propertyTitle: event.data.description,
            id: event.data.id,
          }
        );

        await InvestModel.findOneAndUpdate(
          { _id: pendingInvestment._id },
          {
            status: 'success',
          }
        );
      }
    }

    if (event.type === 'charge:failed') {
      console.log('charge failed');
    }
    if (event.type === 'charge:delayed') {
      console.log('charge delayed');
    }
    if (event.type === 'charge:resolved') {
      console.log('charge resolved');
    }
  } catch (err) {
    console.log('webhook error');
    console.log(err);
  }
};
module.exports = {
  getSingleInvestment,
  getAllInvestment,
  createInvestment,
  createProperty,
  getProperties,
  getSingleProperty,
  updateInvestment,
  successInvestment,
  paymentHandler,
  adminUpdate,
};
