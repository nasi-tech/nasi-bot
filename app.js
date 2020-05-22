process.env["NTBA_FIX_319"] = 1
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const config = require('./config');
const TOKEN = config.token;
const url = config.url; // 你自己的域名
const port = 9000;

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${url}/bot${TOKEN}`);
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/sendMsg', (req, res) => {
  if (req.query.chatId) {
    bot.sendMessage(req.query.chatId, req.query.message);
  }
  res.redirect('/');
});

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/:id/:message', (req, res) => {
  bot.sendMessage(req.params.id, req.params.message);
  res.json({
    message: "OK"
  });
});

bot.onText(/\/myId/, function onLoveText(msg) {
  bot.sendMessage(msg.chat.id, msg.chat.id);
});

bot.onText(/\/prpr/, function onLoveText(msg) {
  const chatId = msg.chat.id;
  request('https://konachan.com/post.json?tags=ass&limit=50', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const result = JSON.parse(body) || [];
      const index = parseInt(Math.random() * result.length);
      bot.sendPhoto(chatId, result[index].file_url, { caption: 'random' })
        .catch((err) => {
          bot.sendMessage(chatId, '图片获取失败');
        })
    } else {
      bot.sendMessage(chatId, '图片获取失败');
    }
  });
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

app.listen(port, () => {
  console.log(`NASI-BOT api server is listening on ${port}`);
});