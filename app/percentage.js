const bot = require('./bot');

/* Percentage */

function perEx(reg, res) {
  bot.onText(reg, (msg, match) => {
    if (clearNum(match[2])) bot.sendMessage(msg.from.id, res(match));
  });
}

function clearNum(match) {
  return match.match(/([\d,.])/g) ? match.match(/([\d,.])/g).join("").replace(/\,/g, ".") : "";
}

function curreNum(match) {
  return match.match(/[^0-9,.\s]/g) ? match.match(/[^0-9,.\s]/g).join("") : "";
}

/* Percentage value: '20% of $10' and '5% of what is 6 EUR' */

perEx(/\/per +([0-9,.\s]+)%\s+of\s+(.+)/i, (match) => {
  if (~curreNum(match[2]).indexOf('whatis')) {
    return (clearNum(match[2]) / clearNum(match[1])) * 100 + " " + curreNum(match[2]).replace(/whatis/g, "");
  } else {
    return (clearNum(match[1]) * clearNum(match[2])) / 100 + " " + curreNum(match[2]);
  }
});

/* Adding percentage: 5% on $30 */

perEx(/\/per +([0-9,.\s]+)%\s+(?:on|\+)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * (+clearNum(match[1]) + 100) + " " + curreNum(match[2]);
});

/* Substracting percentage: 6% off 40 EUR */

perEx(/\/per +([0-9,.\s]+)%\s+(?:off|\-)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * -(+clearNum(match[1]) - 100) + " " + curreNum(match[2]);
});

/* Percentage value of one value relative to another: $50 as a % of $100 */

perEx(/\/per +([^a-z]+)\s+as\s+a\s+%\s+of\s+([^a-z]+)/i, (match) => {
  return clearNum(match[1]) / (clearNum(match[2]) / 100) + "%";
});

/* Value by percent part: 5% of what is 6 EUR */

/*perEx(/\/per +([0-9,.\s]+)%\s+of\s+what\s+is\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / clearNum(match[1])) * 100 + " " + curreNum(match[2]);
});*/