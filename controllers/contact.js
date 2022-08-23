const sendEmail = require('../utils/sendEmail');
const StatusCodes = require('http-status-codes');

const Contact = async (req, res) => {
  const { email, message, name } = req.body;
  const textMessage = `
  <ul>
  <li>Full name: ${name},</li>
  <li>email: ${email},</li>
  <li>message: ${message}</li>
  </ul>
  `;
  await sendEmail({
    from: `${name} <sansfrontierdhc@outlook.com`,
    to: 'sansfrontierdhc@outlook.com',
    subject: `Contact message from ${email}`,
    text: textMessage,
  });
  res.status(StatusCodes.CREATED).json({ status: 'success' });
};

module.exports = Contact;
