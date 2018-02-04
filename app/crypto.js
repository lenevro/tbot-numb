const bot = require('./bot'),
      co = require('cryptocompare'),
      moment = require('moment-timezone'),
      cronNote = require('cron').CronJob;

global.fetch = require('node-fetch');

let coLatest;

function round(data) {
  return Math.round(data * 100) / 100;
}

function getDataCrypto() {
  co.priceHistorical('USD', ['BTC', 'ETH', 'XRP', 'BCH', 'ADA'], new Date(moment().subtract(1, 'day').format('YYYY-MM-DD')))
    .then(data => {
      return data;
    })
    .then(histData => {
      co.price('USD', ['BTC', 'ETH', 'XRP', 'BCH', 'ADA'])
        .then((data) => {
            function formData(unit) {
              const res = round(1/data[unit] - 1/histData[unit]);

              return `${round(1/data[unit])}$ [` + (res > 0 ? `+${res}` : `${res}`) + ']';
            }

            coLatest = [
              `Bitcoin: ${formData('BTC')}*`,
              `Ethereum: ${formData('ETH')}`,
              `Ripple: ${formData('XRP')}`,
              `Bitcoin Cash: ${formData('BCH')}`,
              `Cardano: ${formData('ADA')}`
            ];
          }
        )
        .catch(console.error);
    })
    .catch(console.error);
}

getDataCrypto();

/* Set Cron */

new cronNote({
  cronTime: '00 */1 * * * *',
  onTick() {
    getDataCrypto();
  },
  start: true,
  timeZone: 'Europe/Brussels'
});

/* Data crypto */

function sendDataCrypto(user) {
  bot.sendMessage(user, 

`<b>Top Exchange Rates</b>

${coLatest.join('\n')}

*Difference with the previous day

For another currencies,\nexample: /co XRB`, {

    parse_mode: 'HTML'
  });
}

bot.onText(/^(\/co)$/, (msg, match) => {
  sendDataCrypto(msg.from.id);
});

/* Selected crypto */

function sendSelectedDataCrypto(user, unit) {
  co.priceHistorical(unit, 'USD', new Date(moment().subtract(1, 'day').format('YYYY-MM-DD')))
    .then(data => {
      return data;
    })
    .then(histData => {
      co.price(unit, 'USD')
        .then((data) => {
            return data;
          }
        )
        .then((data) => {
            bot.sendMessage(user, `${unit}: ${round(data.USD)}$ (${round(data.USD - histData.USD)})`);
          }
        )
        .catch((error) => {
            bot.sendMessage(user, error);
          }
        );
    })
    .catch(console.error)
}

bot.onText(/^\/co (.+)/, (msg, match) => {
  const unit = match[1].toUpperCase();

  sendSelectedDataCrypto(msg.from.id, unit);
});

/* Modules */

module.exports.sendDataCrypto = sendDataCrypto;
module.exports.sendSelectedDataCrypto = sendSelectedDataCrypto;