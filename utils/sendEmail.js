const nodemailer = require('nodemailer');
const rateLimit = require('rate-limiter');

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: 'sansfrontierdhc@outlook.com',
      pass: 'mbfibab2018',
    },
  });

  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });

  transporter.verify((err, success) => {
    if (err) {
      console.log(err);
    } else console.log(success);
  });
};

module.exports = sendEmail;
