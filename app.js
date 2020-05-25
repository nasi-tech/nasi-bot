process.env["NTBA_FIX_319"] = 1
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const TOKEN = config.token;
const url = config.url; // 你自己的域名
const port = 9000;
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${url}/bot${TOKEN}`);

// const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.post('/send', async (req, res) => {
  if (req.body.chatId && req.body.message) {
    await bot.sendMessage(req.body.chatId, req.body.message)
      .then(() => {
        res.json({
          code: 0,
          message: "OK"
        });
      }).catch(() => {
        res.json({
          code: -1,
          message: "KO"
        });
      });
  } else {
    res.json({
      code: -1,
      message: "KO"
    });
  }
});

app.post('/sendMd', async (req, res) => {
  const opts = {
    parse_mode: 'Markdown'
  }
  if (req.body.chatId && req.body.message) {
    await bot.sendMessage(req.body.chatId, req.body.message, opts)
      .then(() => {
        res.json({
          message: "OK"
        });
      }).catch(() => {
        res.json({
          code: -1,
          message: "KO"
        });
      });
  } else {
    res.json({
      code: -1,
      message: "KO"
    });
  }
});

app.get('/:id/:message', (req, res) => {
  bot.sendMessage(req.params.id, req.params.message);
  res.json({
    code: -1,
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
    bot.sendMessage(msg.chat.id, msg.chat.id);
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

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

app.listen(port, () => {
  console.log(`NASI-BOT api server is listening on ${port}`);
});