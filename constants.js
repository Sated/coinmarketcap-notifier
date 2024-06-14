require("dotenv").config();
const fs = require("fs");
const path = require("path");

if (!process.env.TELEGRAM_BOT_KEY) {
  console.error("Telegram Bot API key doesnt exist");
  process.exit(1);
}

if (!process.env.TELEGRAM_CHAT_ID) {
  console.error("Telegram chat id doesnt exist");
  process.exit(1);
}

const TELEGRAM_BOT_KEY = process.env.TELEGRAM_BOT_KEY;
const TELEGRAM_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID);
const ROC_PERIOD_H = 24; // 24h
const MAX_RETRY_COUNT = 1;
const RETRY_DELAY_MS = 1500;
const LOCK_MESSAGE_OFFSET_MS = 2 * 60 * 60 * 1000; // 2h
const DB_PATH = fs.existsSync(path.join('/function', 'storage', 'files'))
    ? path.join('/function', 'storage', 'files')
    : __dirname;

const DB_FILE = path.join(DB_PATH, 'db.json');

module.exports = {
  TELEGRAM_BOT_KEY,
  TELEGRAM_CHAT_ID,
  ROC_PERIOD_H,
  MAX_RETRY_COUNT,
  RETRY_DELAY_MS,
  LOCK_MESSAGE_OFFSET_MS,
  DB_FILE,
};
