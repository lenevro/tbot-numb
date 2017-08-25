const request = require('request'),
      bot = require('./bot');

/* Currency function */

bot.onText(/\/cc ([0-9]+) ([a-z]+) to ([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
    const userId = msg.from.id;

    let getDate = match[4] ? match[4].replace(/for /, "") : 'latest',
        result,
        formResult;

    request('http://api.fixer.io/' + getDate + '?base=' + match[2].toUpperCase(), (error, response, body) => {
      let resVal;

      try {
        resVal = JSON.parse(body);

        if (resVal.error || !resVal.rates[match[3].toUpperCase()]) {
          throw new SyntaxError("Incorrect value");
        }
      } catch (e) {
        bot.sendMessage(userId, "Incorrect value");

        return;
      }

      result = match[1] * resVal.rates[match[3].toUpperCase()];
      formResult = match[1] + " " + match[2].toUpperCase() + " = " + Math.round(result * 100) / 100 + " " + match[3].toUpperCase() +
                   (getDate != "latest" ? "\n(Rate for " + getDate + ")" : "");

      bot.sendMessage(userId, formResult);
    });
});

bot.onText(/\/cc ([a-z]+) *(.+[^a-z]+)*/i, (msg, match) => {
    const userId = msg.from.id;
				
    let getDate = match[2] ? match[2].replace(/for /, "") : 'latest',
        result;

    request('http://api.fixer.io/' + getDate + '?base=' + match[1].toUpperCase(), (error, response, body) => {
      let resVal,
          topVal;

      try {
        resVal = JSON.parse(body);

        if (resVal.error) {
          throw new SyntaxError("Incorrect value");
        }
      } catch (e) {
        bot.sendMessage(userId, "Incorrect value");

        return;
      }

      function round(key) {
        return Math.round(resVal.rates[key] * 100) / 100;
      }

      topVal = [
        "🇪🇺 EUR: " + round("EUR"),
        "🇺🇸 USD: " + round("USD"),
        "🇷🇺 RUB: " + round("RUB")
      ];

      topVal.forEach((item, i) => {
        if (~item.indexOf(match[1].toUpperCase())) topVal.splice(i, 1);
      });

      result = "<b>Top " + match[1].toUpperCase() + " Exchange Rates</b>\n\n" + topVal.join("\n") +
               (getDate != "latest" ? "\n\n(Rates for " + getDate + ")" : "");

      bot.sendMessage(userId, result, {
        parse_mode: "HTML"
      });
    });
});