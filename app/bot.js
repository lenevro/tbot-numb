/* Telegram */

const botApi = require('node-telegram-bot-api'),
      agent = require('socks5-https-client/lib/Agent');
      
let token,
    bot;

if (process.env.NODE_ENV === 'production') {
  token = process.env.BOT_TOKEN;

  bot = new botApi(token);
  bot.setWebHook(process.env.URL + bot.token);
} else {
  require('dotenv').config();
  
  token = process.env.BOT_TOKEN_LOCAL;

  bot = new botApi(token, { 
    polling: true,
    request: {
      agentClass: agent,
      agentOptions: {
        socksHost: process.env.PROXY_SOCKS5_HOST,
        socksPort: parseInt(process.env.PROXY_SOCKS5_PORT),
        // socksUsername: process.env.PROXY_SOCKS5_USERNAME,
        // socksPassword: process.env.PROXY_SOCKS5_PASSWORD
      }
    }
  });
  bot.setWebHook();
}

module.exports = bot;

/* Time*/

const moment = require('moment-timezone'),
      cityTimezones = require('city-timezones');

bot.onText(/\/time\s+(.+[^\s])/i, (msg, match) => {
  let time,
      checkZone = cityTimezones.lookupViaCity(match[1]);

  if (moment.tz.zone(match[1])) {
    time = moment().tz(match[1]).format('MMMM Do YYYY, h:mm:ss a');
  } else if (checkZone.length != 0) {
    time = moment().tz(checkZone[0].timezone).format('MMMM Do YYYY, h:mm:ss a');
  } else {
    time = 'Unknown city';
  }

  bot.sendMessage(msg.from.id, time);
});

/* Random */

const Chance = require('chance'),
      chance = new Chance();

bot.onText(/(\/random)$/i, (msg, match) => {
  bot.sendMessage(msg.from.id, chance.integer({min: 0}));
});

bot.onText(/\/random\s+([\d]+)-([\d]+)/i, (msg, match) => {
  try {
    chance.integer({min: +match[1], max: +match[2]})
    bot.sendMessage(msg.from.id, chance.integer({min: +match[1], max: +match[2]}));
  } catch (e) {
    bot.sendMessage(msg.from.id, e.message.replace('Chance: ',''));
  }
});

/* Modules */

let inlineExcept = [];

module.exports.inlineExcept = inlineExcept;

require('./math');
require('./currency');
require('./crypto');
require('./note');
require('./charts');
require('./messages');