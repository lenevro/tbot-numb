const bot = require('./bot');

/* Help */

bot.onText(/(\/help)$/, (msg) => {
  bot.sendMessage(msg.from.id,

`You can use this service commands:

Inline message - math operations,
example: sqrt(256) * log(10, 2) * 2^4

\/cc [value] - currency conversion & top exchange rates,
example: /cc usd

\/co - cryptocurrency rates,
example: /co

\/tz [city name] - set your timezone,
example: /tz Moscow

\/time [city name] - get time for the city,
example: /time Moscow

\/note [00:00 note] - set note,
example: /note 08:00 - stand up dude

\/note_ls - get note list,
example: /note_ls

\/note_rm [number] - remove note,
example: /note_rm 2

Read more: leusrox.github.io/numix`, {
    parse_mode: 'HTML'
  });
});

/* Currency */

bot.onText(/(\/cc)$/, (msg) => {
  const userId = msg.from.id;

  bot.sendMessage(userId, 'Choose currency:', {
    'reply_markup': {
      'keyboard': [
        ['USD', 'EUR', 'JPY'],
        ['AUD', 'CHF', 'CAD'],
        ['RUB'],
        ['All currencies']
      ],
      'resize_keyboard': true,
      'one_time_keyboard': true
    }
  });
});

bot.on('message', (msg) => {
  const userId = msg.from.id;

  if (msg.text == 'All currencies') {
    bot.sendMessage(userId, 'Choose currency:', {
      'reply_markup': {
        'keyboard': [
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
          ['USD', 'ZAR']
        ],
        'resize_keyboard': true,
        'one_time_keyboard': true
      }
    });
  }
});

/* Notes */

bot.onText(/(\/note)$/, (msg) => {
  bot.sendMessage(msg.from.id,

`You can use this service commands for notes:

\/note [00:00 note] - set note,
example: /note 08:00 - stand up dude

\/note_ls - get note list,
example: /note_ls

\/note_rm [number] - remove note,
example: /note_rm 2`

  );
});