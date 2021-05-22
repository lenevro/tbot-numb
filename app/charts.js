const Chance = require('chance');
const bot = require('./bot');

const inlineExcept = bot.inlineExcept;

const chance = new Chance();

function sendChartCurrency(unit, user) {
  const src = `${process.env.CHART + unit.replace(/\//g, '')}&amount=335&chart_height=340&chart_width=660&grtype=0&tictype=4&iId=5?${chance.string()}`;

  bot.sendPhoto(user, src,
    {
      caption: unit,
    });
}

const chartList = ['EUR/RUB', 'USD/RUB', 'AUD/JPY', 'AUD/USD', 'CAD/JPY', 'CHF/JPY', 'EUR/AUD', 'EUR/CAD', 'EUR/CHF',
  'EUR/GBP', 'EUR/JPY', 'EUR/USD', 'GBP/CHF', 'GBP/JPY', 'GBP/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY'];

bot.on('message', msg => {
  const userId = msg.from.id;
  const unit = msg.text.toUpperCase();

  if (chartList.includes(unit)) {
    sendChartCurrency(unit, userId);
  }
});

Array.prototype.push.apply(inlineExcept, chartList);
