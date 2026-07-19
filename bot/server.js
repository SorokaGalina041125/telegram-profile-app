const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PROFILE_URL = 'https://telegram-profile-app-git-main-sorokagalina041125s-projects.vercel.app';
const PRODUCT_URL = 'https://telegram-product-app-six.vercel.app/';

// Генерируем общую сессию для демонстрации
const SHARED_SESSION = `shared_session_${Date.now()}`;

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '👋 Добро пожаловать! Демонстрация общей сессии между Mini App:\n\nВыберите приложение:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Карточка товара', web_app: { url: PRODUCT_URL } }],
        [{ text: '👤 Профиль', web_app: { url: PROFILE_URL } }]
      ]
    }
  });
});

console.log('Бот запущен!');