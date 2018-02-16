/* Telegram */

const botApi = require('node-telegram-bot-api');
      
let token,
    bot;

if (process.env.NODE_ENV === 'production') {
  token = process.env.BOT_TOKEN;

  bot = new botApi(token);
  bot.setWebHook(process.env.URL + bot.token);
} else {
  require('dotenv').config();
  
  token = process.env.BOT_TOKEN_LOCAL;

  bot = new botApi(token, { polling: true });
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

/* Modules */

require('./math');
require('./currency');
require('./crypto');
require('./note');
require('./charts');
require('./messages');