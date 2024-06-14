# CoinMarketCap Notifier

This is a Telegram bot that fetches cryptocurrency prices from CoinMarketCap and sends notifications to a specified chat on Telegram based on certain conditions.

> `index.js` is designed to be executed as a [Yandex Cloud Function](https://cloud.yandex.ru/ru/docs/functions/lang/nodejs/) or other serverless function executor. For run from the console, use `npm run start` or `node run.js`

## Prerequisites

Before running the bot, make sure you have the following:

- Node.js >=18 installed on your machine
- A Telegram bot API key
- A Telegram chat ID

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Sated/coinmarketcap-notifier.git
```

2. Install the dependencies:

```bash
cd coinmarketcap-notifier
npm install
```

3. Create a `.env` file at the root of the project and add the following environment variables:

```bash
TELEGRAM_BOT_KEY=your-telegram-bot-api-key
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

## Usage

To start the bot, run the following command:

```bash
node run.js
```

The bot will fetch cryptocurrency prices from CoinMarketCap and send notifications to the specified Telegram chat based on the conditions specified in the `currencies` object.

You can modify the `currencies` object in the `index.js` file to add or remove cryptocurrencies and customize the conditions for sending notifications.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for more information.
