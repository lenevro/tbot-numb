const bot = require('./bot'),
      fetch = require('node-fetch'),
      fx = require('money'),
      moment = require('moment-timezone'),
      cronNote = require('cron').CronJob;
      
let fxLatest,
    fxYester;

function round(data) {
  return Math.round(data * 1000) / 1000;
}

function getDataCurrency() {
  fetch('https://api.fixer.io/latest')
    .then((resp) => {
        return resp.json();
      }
    )
    .then((data) => {
        fxLatest = data;
        fxLatest.rates['EUR'] = 1;

        console.log(`Update latest rates! ${moment().format('h:mm:ss a')}`);

        return moment(data.date).subtract(1, 'day').format('YYYY-MM-DD');
      }
    )
    .then((date) => {
        fetch('https://api.fixer.io/' + date)
          .then((resp) => {
              return resp.json();
            }
          )
          .then((data) => {
            fxYester = data;
            fxYester.rates['EUR'] = 1;

            console.log(`Update yester rates! ${moment().format('h:mm:ss a')}`);
          })
      }
    );
}

getDataCurrency();

/* Set Cron */

new cronNote({
  cronTime: '00 59 * * * *',
  onTick() {
    getDataCurrency();
  },
  start: true,
  timeZone: 'Europe/Brussels'
});

/* Bot Msg */

bot.onText(/\/cc ([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
  const userId = msg.from.id,
        date = match[2] ? match[2].replace(/for /, '') : 'latest';
      
  let getData;

  if (date != 'latest') {
    fetch('https://api.fixer.io/' + date)
      .then((resp) => {
          return resp.json();
        }
      )
      .then((data) => {
          fx.rates = data.rates;
          fx.rates['EUR'] = 1;
        }
      )
      .then(() => {
          getData = key => round(fx(1).from(match[1].toUpperCase()).to(key));

          sendMsg();
        }
      );
  } else {
    getData = (key) => {
      fx.rates = fxYester.rates;
      const yester = round(fx(1).from(match[1].toUpperCase()).to(key));

      fx.rates = fxLatest.rates;
      const latest = round(fx(1).from(match[1].toUpperCase()).to(key));

      return `${latest} [` + ((latest - yester) > 0 ? '+' + round(latest - yester) : round(latest - yester)) + ']';
    }

    sendMsg();
  }

  function sendMsg() {
    const topVal = [
      `🇪🇺 EUR: ${getData('EUR')}`,
      `🇺🇸 USD: ${getData('USD')}`,
      `🇷🇺 RUB: ${getData('RUB')}`
    ];

    topVal.forEach((item, i) => {
      if (~item.indexOf(match[1].toUpperCase())) topVal.splice(i, 1);
    });

    const result = `<b>Top ${match[1].toUpperCase()} Exchange Rates</b>\n\n` + topVal.join('\n') +
                   (date != 'latest' ? `\n\n(Rates for ${date})` : `\n\n(Last update: ${fxLatest.date})`);

    bot.sendMessage(userId, result, {
      parse_mode: 'HTML'
    });
  }
});

bot.onText(/\/cc ([0-9]+) ([a-z]+) to ([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
  const userId = msg.from.id,
        date = match[4] ? match[4].replace(/for /, '') : 'latest';

  if (date != 'latest') {
    fetch('https://api.fixer.io/' + date)
      .then((resp) => {
          return resp.json();
        }
      )
      .then((data) => {
          fx.rates = data.rates;
          fx.rates['EUR'] = 1;
        }
      )
      .then(() => sendMsg());
  } else {
    fx.rates = fxLatest.rates;

    sendMsg();
  }

  function sendMsg() {
    const result = fx(match[1]).from(match[2].toUpperCase()).to(match[3].toUpperCase());

    const buildMsg = `${match[1]} ${match[2].toUpperCase()} = ${round(result)} ${match[3].toUpperCase()}` +
                     (date != 'latest' ? `\n(Rate for ${date})` : `\n(Last update: ${fxLatest.date})`);

    bot.sendMessage(userId, buildMsg);
  }
});