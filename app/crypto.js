const bot = require('./bot'),
      co = require('cryptocompare'),
      cronNote = require('cron').CronJob;

global.fetch = require('node-fetch');

let coLatest;

function round(data) {
  return Math.round(data * 100) / 100;
}

function getDataCrypto() {
  co.price('USD', ['BTC', 'ETH', 'XRP', 'BCH', 'ADA'])
    .then((data) => {
        coLatest = [
          `Bitcoin: ${round(1/data.BTC)}$`,
          `Ethereum: ${round(1/data.ETH)}$`,
          `Ripple: ${round(1/data.XRP)}$`,
          `Bitcoin Cash: ${round(1/data.BCH)}$`,
          `Cardano: ${round(1/data.ADA)}$`
        ];
      }
    )
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

For another currencies,\nexample: /co XRB`, {

    parse_mode: 'HTML'
  });
}

bot.onText(/^(\/co)$/, (msg, match) => {
  sendDataCrypto(msg.from.id);
});

/* Selected crypto */

function sendSelectedDataCrypto(user, unit) {
  co.price(unit, 'USD')
    .then((data) => {
        return data;
      }
    )
    .then((data) => {
        bot.sendMessage(user, `${unit}: ${data.USD}$`);
      }
    )
    .catch((error) => {
        bot.sendMessage(user, error);
      }
    );
}

bot.onText(/^\/co (.+)/, (msg, match) => {
  const unit = match[1].toUpperCase();

  sendSelectedDataCrypto(msg.from.id, unit);
});

/* Modules */

module.exports.sendDataCrypto = sendDataCrypto;
module.exports.sendSelectedDataCrypto = sendSelectedDataCrypto;