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
// const bot = new TelegramBot(TOKEN, { polling: true });
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

bot.onText(/\/start/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      resize_keyboard: true,
      keyboard: [["获取chatId", "获取新的botAPI地址", "帮助Help"]]
    })
  }
  bot.sendMessage(msg.chat.id, '选择需要的服务?', opts);
});

bot.on('message', msg => {
  if (msg.text === '获取chatId') {
    bot.sendMessage(msg.chat.id, "Your Telegram ID is : " + msg.chat.id);
  }
  if (msg.text === '获取新的botAPI地址') {
    bot.sendMessage(msg.chat.id, config.url);
  }
  if (msg.text === '帮助Help') {
    bot.sendMessage(msg.chat.id, "欢迎使用NASI-TECH自助服务机器人");
  }
});

bot.onText(/\/id/, function onLoveText(msg) {
  bot.sendMessage(msg.chat.id, msg.chat.id);
});

// Matches /love
bot.onText(/\/love/, function onLoveText(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Yes, you are the bot of my life ❤'],
        ['No, sorry there is another one...']
      ]
    })
  };
  bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
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