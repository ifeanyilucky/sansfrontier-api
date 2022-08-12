const config = {};

config.website = process.env.HOST;
// config.website = 'http://www.lemox.io';

config.web = {};
config.email = {};

config.name = 'Lemox';

config.address = '26, Boulevard Royal. Luxembourg 2449';
config.linkedIn = 'https://www.linkedin.com/company/lemox_co';
config.medium = 'https://medium.com/@lemox';
config.facebook = 'https://www.facebook.com/Lemox-101380271875067/';
config.telegram = 'https://t.me/lemoxco';
config.twitter = 'https://twitter.com/Lemox_io';

config.email.support = 'support@lemox.io';
config.email.supportEmbed = `Lemox Support <support@lemox.io>`;
config.email.admin = 'admin@lemox.io';
config.email.info = 'info@lemox.io';

module.exports = config;
