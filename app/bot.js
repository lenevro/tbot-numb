require('dotenv').config();

/* Telegram */

const botApi = require('node-telegram-bot-api');
      
let token,
    bot;

if (process.env.NODE_ENV === 'production') {
  token = process.env.BOT_TOKEN;

  bot = new botApi(token);
  bot.setWebHook(process.env.URL + bot.token);
} else {
  token = process.env.BOT_TOKEN_LOCAL;

  bot = new botApi(token, { polling: true });
  bot.setWebHook();
}

/* Modules */

module.exports = bot;

require('./currency');
require('./percentage');