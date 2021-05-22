const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./../package.json');

const app = express();

app.get('/', (req, res) => {
  res.json({ name: packageInfo.name });
});

const server = app.listen(process.env.PORT || 8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Web server started at', host, port);
});

app.use(bodyParser.json());

module.exports = (bot) => {
  app.post(`/${bot.token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });
};
