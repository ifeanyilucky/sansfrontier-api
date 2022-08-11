require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const xss = require('xss-clean');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
const authRouter = require('./routes/auth');
const investmentRouter = require('./routes/investment');
const propertyRouter = require('./routes/property');
const withdrawalRouter = require('./routes/withdrawal');
const userRouter = require('./routes/users');
const staticRouter = require('./routes/static');
const identityRouter = require('./routes/identityVerification.js');
const contact = require('./routes/contact');
// ERROR MIDDLEWARE
const errorHandlerMiddleware = require('./middlewares/error-handler');
const NotFound = require('./middlewares/not-found');

// CONNECT DATABASE
const connectDb = require('./db/connect');

app.set('trust proxy', 1);
// MIDDLEWARE
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(morgan('dev'));

app.use(
  bodyParser.json({
    verify: (req, res, buf, next) => {
      if (req.originalUrl === '/api/v1/investment/payment-handler') {
        req.rawBody = buf;
      }
    },
    limit: '50mb',
  })
);
app.use(bodyParser.json());
// CORS
const whitelist = [process.env.CORS_DOMAIN];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());

// ROUTES
app.use('/api/v1/auth/', authRouter);
app.use('/api/v1/investment', investmentRouter);
app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/withdrawal', withdrawalRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/static', staticRouter);
app.use('/api/v1/identity', identityRouter);
app.use('/api/v1/contact', contact);

app.use(express.static(path.join(__dirname + '/public')));
app.use(express.static(path.join(__dirname, 'views')));

app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.send(
    ` <h1>Lemox Property Investment API</h1> 
    <p>There's no documentation on how to use API</p> `
  );
});

app.use(NotFound);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDb(process.env.MONGODB_URI);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
