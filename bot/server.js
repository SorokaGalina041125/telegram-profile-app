require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CATALOG_URL = 'https://telegram-mini-app-zeta-navy.vercel.app';
const PROFILE_URL = 'https://telegram-profile-app-git-main-sorokagalina041125s-projects.vercel.app';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '👋 Добро пожаловать! Демонстрация общей сессии между Mini App:\n\nВыберите приложение:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📋 Каталог товаров', web_app: { url: CATALOG_URL } }
        ],
        [
          { text: '👤 Профиль', web_app: { url: PROFILE_URL } }
        ]
      ]
    }
  });
});

console.log('Бот запущен!');