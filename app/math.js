const bot = require('./bot'),
      math = require('mathjs'),
      currencyList = require('./currency').currencyList,
      chartList = require('./charts').chartList,
      inlineExcept = require('./bot').inlineExcept;

let regList = [];

function round(data) {
  return Math.round(data * 1000) / 1000;
}

/* 
  Percentage 
*/

function perEx(reg, res) {
  regList.push(reg);

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
  return match.match(/([^\d,.])/g) ? match.match(/([^\d,.])/g).join('') : '';
}

/* Adding percentage: '5% on $30' and '$30 on 5%' */

perEx(/([\d,.]+)%\s+(?:on|\+)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * (+clearNum(match[1]) + 100) + ' ' + curreNum(match[2]);
});

perEx(/(.+)\s+(?:on|\+)\s+([\d,.]+)%/i, (match) => {
  return (clearNum(match[1]) / 100) * (+clearNum(match[2]) + 100) + ' ' + curreNum(match[1]);
});

/* Substracting percentage: '6% off 40 EUR' and '40 EUR off 6%' */

perEx(/([\d,.]+)%\s+(?:off|\-)\s+(.+)/i, (match) => {
  return (clearNum(match[2]) / 100) * -(+clearNum(match[1]) - 100) + ' ' + curreNum(match[2]);
});

perEx(/(.+)\s+(?:off|\-)\s+([\d,.]+)%/i, (match) => {
  return (clearNum(match[1]) / 100) * -(+clearNum(match[2]) - 100) + ' ' + curreNum(match[1]);
});

/* Percentage value: '20% of $10' and '5% of what is 6 EUR' */

perEx(/([\d,.]+)%\s+of\s+(.+)/i, (match) => {
  if (curreNum(match[2]).includes('what')) {
    return (clearNum(match[2]) / clearNum(match[1])) * 100 + ' ' + curreNum(match[2]).replace(/what|is|\s/g, '');
  } else {
    return (clearNum(match[1]) * clearNum(match[2])) / 100 + ' ' + curreNum(match[2]);
  }
});

/* Percentage value of one value relative to another: $50 as a % of $100 */

perEx(/([^a-z]+)\s+as\s+a\s+%\s+of\s+([^a-z]+)/i, (match) => {
  return clearNum(match[1]) / (clearNum(match[2]) / 100) + '%';
});

/* 
  CSS
*/

function cssEx(reg, res) {
  regList.push(reg);

  bot.onText(reg, (msg, match) => {
    bot.sendMessage(msg.from.id, res(match));
  });
}

let em = 16,
    ppi = 96;

/* em & ppi */

bot.onText(/(\/em)$/, (msg) => {
  bot.sendMessage(msg.from.id, 'em = ' + em);
});

bot.onText(/^\/em\s+([0-9.,]+)/, (msg, match) => {
  em = match[1].replace(/\,/g, '.');

  if (em[--em.length] == '.') em = em.replace(/.$/g, '.0');

  bot.sendMessage(msg.from.id, 'em = ' + em);
});

bot.onText(/(\/ppi)$/, (msg) => {
  bot.sendMessage(msg.from.id, 'ppi = ' + ppi);
});

bot.onText(/^\/ppi\s+([0-9.,]+)/, (msg, match) => {
  ppi = match[1].replace(/\,/g, '.');

  if (ppi[--em.length] == '.') ppi = ppi.replace(/.$/g, '.0');

  bot.sendMessage(msg.from.id, 'ppi = ' + ppi);
});

/* em: '1.2 em in px' */

cssEx(/([\d,.]+)(?:\s+)?em\s+in\s+px/i, (match) => {
  return round(match[1] * em) + `\n\n/em = ${em}`;
});

/* pt: '1.2 pt in px' */

cssEx(/([\d,.]+)(?:\s+)?pt\s+in\s+px/i, (match) => {
  return round((match[1] * ppi) / 72) + `\n\n/ppi = ${ppi}`;
});

/* inch: '1 inch in px' */

cssEx(/([\d,.]+)(?:\s+)?inch\s+in\s+px/i, (match) => {
  return round(match[1] * ppi) + `\n\n/ppi = ${ppi}`;
});

/* cm: '1.2 cm in px' */

cssEx(/([\d,.]+)(?:\s+)?cm\s+in\s+px/i, (match) => {
  return round(match[1] * (ppi / 2.54)) + `\n\n/ppi = ${ppi}`;
});

/* 
  Math 
*/

bot.on('message', (msg) => {
  const userMsg = msg.text,
        userId = msg.from.id;

  let checkPer;

  /* Check inline messages */

  regList.forEach((reg) => {
    if (userMsg.match(reg)) checkPer = true;
  });

  if (userMsg.match(/^\//) || inlineExcept.includes(userMsg.toUpperCase()) || checkPer) return;

  /* Go mathjs */

  let result;

  try {
    result = math.evaluate(msg.text);
  } catch (e) {
    bot.sendMessage(userId, e.message);

    return;
  }

  if (typeof result == 'object') return;

  bot.sendMessage(userId, result);
});
