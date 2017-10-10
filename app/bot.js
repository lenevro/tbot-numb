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

/* Math */

const math = require('mathjs');

bot.on('message', (msg) => {
  if (msg.text.match(/^\//)) return;

  const userId = msg.from.id;

  let resVal;

  try {
    resVal = math.eval(msg.text);
  } catch (e) {
    bot.sendMessage(userId, e.message);

    return;
  }

  bot.sendMessage(userId, resVal);
});

/* Time*/

const moment = require('moment-timezone'),
      cityTimezones = require('city-timezones');

bot.onText(/\/time\s+(.+[^\s])/i, (msg, match) => {
  let resVal,
      checkZone = cityTimezones.lookupViaCity(match[1]);

  if (moment.tz.zone(match[1])) {
    resVal = moment().tz(match[1]).format('MMMM Do YYYY, h:mm:ss a');
  } else if (checkZone.length != 0) {
    resVal = moment().tz(checkZone[0].timezone).format('MMMM Do YYYY, h:mm:ss a');
  } else {
    resVal = 'Incorrect value';
  }

  bot.sendMessage(msg.from.id, resVal);
});

/* Modules */

module.exports = bot;

require('./currency');
require('./percentage');