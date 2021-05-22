const bot = require('./bot');

const helpMsg = `You can use this service commands:

Inline message - math operations,
example: sqrt(256) * log(10, 2) * 2^4

\/cc [value] - currency conversion & top exchange rates,
example: /cc usd

\/charts - currency charts,
example: /charts

\/co - cryptocurrency rates,
example: /co

\/tz [city name] - set your timezone,
example: /tz Moscow

\/time [city name] - get time for the city,
example: /time Moscow

\/note [00:00 note] - set note,
example: /note 08:00 stand up dude

\/note_ls - get note list,
example: /note_ls

\/note_rm [number] - remove note,
example: /note_rm 2

\/random [min]-[max] - get random number,
example: /random 0-17

\/rate - evaluate the bot ❤️🙏😘

Read more: leusrox.github.io/numix`;

const rateMsg = 'If you like this bot, please rate it and write a review about it in the Store Bot: https://telegram.me/storebot?start=numixbot';

/* Help */

bot.onText(/(\/start)$/, (msg) => {
  bot.sendMessage(msg.from.id, helpMsg, {
    parse_mode: 'HTML',
  });
});

bot.onText(/(\/help)$/, (msg) => {
  bot.sendMessage(msg.from.id, helpMsg, {
    parse_mode: 'HTML',
  });
});

/* Currency */

bot.onText(/(\/cc)$/, (msg) => {
  const userId = msg.from.id;

  bot.sendMessage(userId, 'Choose currency:', {
    reply_markup: {
      keyboard: [
        ['USD', 'EUR', 'JPY'],
        ['AUD', 'CHF', 'CAD'],
        ['RUB'],
        ['All currencies'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.on('message', (msg) => {
  const userId = msg.from.id;

  if (msg.text == 'All currencies') {
    bot.sendMessage(userId, 'Choose currency:', {
      reply_markup: {
        keyboard: [
          ['AUD', 'BGN', 'BRL'],
          ['CAD', 'CHF', 'CNY'],
          ['CZK', 'DKK', 'EUR'],
          ['GBP', 'HKD', 'HRK'],
          ['HUF', 'IDR', 'ILS'],
          ['INR', 'JPY', 'KRW'],
          ['MXN', 'MYR', 'NOK'],
          ['NZD', 'PHP', 'PLN'],
          ['RON', 'RUB', 'SEK'],
          ['SGD', 'THB', 'TRY'],
          ['USD', 'ZAR'],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }
});

/* Chart */

bot.onText(/(\/charts)$/, (msg) => {
  const userId = msg.from.id;

  bot.sendMessage(userId, 'Choose pair:', {
    reply_markup: {
      keyboard: [
        ['EUR/RUB', 'USD/RUB', 'AUD/JPY'],
        ['AUD/USD', 'CAD/JPY', 'CHF/JPY'],
        ['EUR/AUD', 'EUR/CAD', 'EUR/CHF'],
        ['EUR/GBP', 'EUR/JPY', 'EUR/USD'],
        ['GBP/CHF', 'GBP/JPY', 'GBP/USD'],
        ['USD/CAD', 'USD/CHF', 'USD/JPY'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

/* Notes */

bot.onText(/(\/note)$/, (msg) => {
  bot.sendMessage(msg.from.id,

    `You can use this service commands for notes:

\/note [00:00 note] - set note,
example: /note 08:00 stand up dude

\/note_ls - get note list,
example: /note_ls

\/note_rm [number] - remove note,
example: /note_rm 2`);
});

/* Rate */

bot.onText(/(\/rate)$/, (msg) => {
  bot.sendMessage(msg.from.id, rateMsg, {
    parse_mode: 'HTML',
  });
});
