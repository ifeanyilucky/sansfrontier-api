const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'sansfrontiertoken@gmail.com',
      pass: 'mbfibab2018',
      clientId:
        '930095309912-mpjhtme3e5ljpbf14to287dp4tovt19g.apps.googleusercontent.com',
      clientSecret: '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',
      refreshToken:
        '1//04XYCdd5ZxV4kCgYIARAAGAQSNwF-L9IrynwXH3Bkd7_dN3D3yxrrnI25rNMrRUFCXn57RlObvCX-g4IAVryriWzi04JAmCNG-2k',
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
