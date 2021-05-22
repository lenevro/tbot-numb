const fetch = require('node-fetch');
const fx = require('money');
const moment = require('moment-timezone');
const CronNote = require('cron').CronJob;
const bot = require('./bot');

const inlineExcept = bot.inlineExcept;

let fxLatest;
let fxYester;

function round(data) {
  return Math.round(data * 1000) / 1000;
}

function getDataCurrency() {
  fetch(`http://data.fixer.io/api/latest?access_key=${process.env.API}`)
    .then((resp) => resp.json())
    .then((data) => {
      fxLatest = data;
      fxLatest.rates.EUR = 1;

      console.log(`Update latest rates! ${moment().format('h:mm:ss a')}`);

      return moment(data.date).subtract(1, 'day').format('YYYY-MM-DD');
    })
    .then((date) => {
      fetch(`http://data.fixer.io/api/${date}?access_key=${process.env.API}`)
        .then((resp) => resp.json())
        .then((data) => {
          fxYester = data;
          fxYester.rates.EUR = 1;

          console.log(`Update yester rates! ${moment().format('h:mm:ss a')}`);
        });
    });
}

getDataCurrency();

/* Set Cron */

const cronNote = new CronNote({
  cronTime: '0 0 */2 * * *',
  onTick() {
    getDataCurrency();
  },
  start: true,
  timeZone: 'Europe/Brussels',
});

cronNote.start();

/* Bot Msg */

/*
  Data currency:
    /cc usd;
    /cc usd for 2010-10-10;
*/

function sendDataCurrency(unit, user, date) {
  let getData;

  if (date !== 'latest') {
    fetch(`http://data.fixer.io/api/${date}?access_key=${process.env.API}`)
      .then((resp) => resp.json())
      .then((data) => {
        fx.rates = data.rates;
        fx.rates.EUR = 1;
      })
      .then(() => {
        getData = key => round(fx(1).from(unit).to(key));

        sendMsg();
      });
  } else {
    getData = (key) => {
      fx.rates = fxYester.rates;
      const yester = round(fx(1).from(unit).to(key));

      fx.rates = fxLatest.rates;
      const latest = round(fx(1).from(unit).to(key));

      return `${latest} [${(latest - yester) > 0 ? `+${round(latest - yester)}` : round(latest - yester)}]`;
    };

    sendMsg();
  }

  function sendMsg() {
    const topVal = [
      `🇺🇸 USD: ${getData('USD')}`,
      `🇪🇺 EUR: ${getData('EUR')}`,
      `🇯🇵 JPY: ${getData('JPY')}`,
      // `🇦🇺 AUD: ${getData('AUD')}`,
      `🇨🇭 CHF: ${getData('CHF')}`,
      `🇨🇦 CAD: ${getData('CAD')}`,
      `🇷🇺 RUB: ${getData('RUB')}`,
    ];

    topVal.forEach((item, i) => {
      if (item.includes(unit)) {
        topVal.splice(i, 1);
      }
    });

    const result = `<b>Top ${unit} Exchange Rates</b>\n\n${topVal.join('\n')
    }${date !== 'latest' ? `\n\n(Rates for ${date})` : `\n\n(Last update: ${fxLatest.date})`}`;

    bot.sendMessage(user, result, {
      parse_mode: 'HTML',
    });
  }
}

bot.onText(/^\/cc\s+([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
  const userId = msg.from.id;
  const unit = match[1].toUpperCase();
  const date = match[2] ? match[2].replace(/for /, '') : 'latest';

  if (!date.match(/\d{4}-(?:0[1-9]|1[012])-(?:0[1-9]|[12][0-9]|3[01])/i) && date !== 'latest') return;

  sendDataCurrency(unit, userId, date);
});

/*
  Custom data currency:
    /cc 1 usd to rub;
    /cc 1 usd to rub for 2010-10-10;
*/

function sendCustomDataCurrency(unitNum, unit, unitCon, user, date) {
  if (date !== 'latest') {
    fetch(`http://data.fixer.io/api/${date}?access_key=${process.env.API}`)
      .then((resp) => resp.json())
      .then((data) => {
        fx.rates = data.rates;
        fx.rates.EUR = 1;
      })
      .then(() => sendMsg());
  } else {
    fx.rates = fxLatest.rates;

    sendMsg();
  }

  function sendMsg() {
    const result = fx(unitNum).from(unit).to(unitCon);

    const buildMsg = `${unitNum} ${unit} = ${round(result)} ${unitCon}${
      date !== 'latest' ? `\n(Rate for ${date})` : `\n(Last update: ${fxLatest.date})`}`;

    bot.sendMessage(user, buildMsg);
  }
}

bot.onText(/^\/cc\s+([\d,.\s]+)\s+([a-z]+)\s+to\s+([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
  const userId = msg.from.id;
  const unitNum = match[1].replace(/,/g, '.').replace(/\s/g, '');
  const unit = match[2].toUpperCase();
  const unitCon = match[3].toUpperCase();
  const date = match[4] ? match[4].replace(/for /, '') : 'latest';

  if (!date.match(/\d{4}-(?:0[1-9]|1[012])-(?:0[1-9]|[12][0-9]|3[01])/i) && date !== 'latest') return;

  sendCustomDataCurrency(unitNum, unit, unitCon, userId, date);
});

/*
  Inline:
    USD
*/

const currencyList = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR', 'EUR', 'ALL CURRENCIES'];

bot.on('message', msg => {
  const userId = msg.from.id;
  const unit = msg.text.toUpperCase();

  if (currencyList.includes(unit) && msg.text !== 'All currencies') {
    sendDataCurrency(unit, userId, 'latest');
  }
});

Array.prototype.push.apply(inlineExcept, currencyList);

/* Modules */

module.exports.sendDataCurrency = sendDataCurrency;
module.exports.sendCustomDataCurrency = sendCustomDataCurrency;
