const bot = require('./bot'),
      math = require('mathjs'),
      currencyList = require('./currency').currencyList,
      chartList = require('./charts').chartList,
      inlineExcept = require('./bot').inlineExcept;

/* Percentage */

let perRegList = [];

function perEx(reg, res) {
  perRegList.push(reg);

  bot.onText(reg, (msg, match) => {
    if (clearNum(match[2])) {
      bot.sendMessage(msg.from.id, res(match));
    }
  });
}

function clearNum(match) {
  return match.match(/([\d,.])/g) ? match.match(/([\d,.])/g).join('').replace(/\,/g, '.') : '';
}

function curreNum(match) {
  return match.match(/[\D,.\s]/g) ? match.match(/[\D,.\s]/g).join('') : '';
}

/* Adding percentage: '5% on $30' and '$30 on 5%'*/

perEx(/([\d,.]+)%\s+(?:on|\+)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * (+clearNum(match[1]) + 100) + ' ' + curreNum(match[2]);
});

perEx(/(.+)\s+(?:on|\+)\s+([\d,.]+)%/i, (match) => {
  return (clearNum(match[1]) / 100) * (+clearNum(match[2]) + 100) + ' ' + curreNum(match[1]);
});

/* Substracting percentage: '6% off 40 EUR' and '40 EUR off 6%'*/

perEx(/([\d,.]+)%\s+(?:off|\-)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * -(+clearNum(match[1]) - 100) + ' ' + curreNum(match[2]);
});

perEx(/(.+)\s+(?:off|\-)\s+([\d,.]+)%/i, (match) => {
  return (clearNum(match[1]) / 100) * -(+clearNum(match[2]) - 100) + ' ' + curreNum(match[1]);
});

/* Percentage value: '20% of $10' and '5% of what is 6 EUR' */

perEx(/([\d,.]+)%\s+of\s+(.+)/i, (match) => {
  if (~curreNum(match[2]).indexOf('whatis')) {
    return (clearNum(match[2]) / clearNum(match[1])) * 100 + ' ' + curreNum(match[2]).replace(/whatis/g, '');
  } else {
    return (clearNum(match[1]) * clearNum(match[2])) / 100 + ' ' + curreNum(match[2]);
  }
});

/* Percentage value of one value relative to another: $50 as a % of $100 */

perEx(/([^a-z]+)\s+as\s+a\s+%\s+of\s+([^a-z]+)/i, (match) => {
  return clearNum(match[1]) / (clearNum(match[2]) / 100) + '%';
});

/* Math */

bot.on('message', (msg) => {
  const userMsg = msg.text,
        userId = msg.from.id;

  let checkPer;

  /* Check inline messages */

  perRegList.forEach((reg) => {
    if (userMsg.match(reg)) checkPer = true;
  });

  if (userMsg.match(/^\//) || ~inlineExcept.indexOf(userMsg.toUpperCase()) || checkPer) return;

  /* Go mathjs */

  let result;

  try {
    result = math.eval(msg.text);
  } catch (e) {
    bot.sendMessage(userId, e.message);

    return;
  }

  if (typeof result == 'object') return;

  bot.sendMessage(userId, result);
});