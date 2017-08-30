require('dotenv').config();

const math = require('mathjs');

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

/* Math */

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

/* Modules */

module.exports = bot;

require('./currency');
require('./percentage');