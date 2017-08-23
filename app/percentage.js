const bot = require('./bot');

/* Percentage */

function perEx(reg, res) {
  bot.onText(reg, (msg, match) => {
    bot.sendMessage(msg.from.id, res(match));
  });
}

/* Percentage value: 20% of $10 */

perEx(/\/per +([0-9]+)% of ([^a-z]+)/i, (match) => {
  return (match[1] * match[2].match(/\d+/)[0]) / 100;
});

/* Adding percentage: 5% on $30 */

perEx(/\/per +([0-9]+)% on ([^a-z]+)/i, (match) => {
  return (match[2].match(/\d+/)[0] / 100) * (+match[1] + 100);
});

/* Substracting percentage: 6% off 40 EUR */

perEx(/\/per +([0-9]+)% off ([^a-z]+)/i, (match) => {
  return (match[2].match(/\d+/)[0] / 100) * -(+match[1] - 100);
});

/* Percentage value of one value relative to another: $50 as a % of $100 */

perEx(/\/per +([^a-z]+) as a % of ([^a-z]+)/i, (match) => {
  return match[1].match(/\d+/)[0] / (match[2].match(/\d+/)[0] / 100);
});

/* Value by percent part: 5% of what is 6 EUR */

perEx(/\/per +([0-9]+)% of what is ([^a-z]+)/i, (match) => {
  return (match[2].match(/\d+/)[0] / match[1]) * 100;
});