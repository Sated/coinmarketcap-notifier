const { TELEGRAM_BOT_KEY,  TELEGRAM_CHAT_ID} = require("../constants.js");

/**
 * Send message to Telegram
 * @param {string} msg - The text of the message
 * @returns Promise<any>
 */
async function sendMessage(msg = "") {
  try {
    if (!msg) {
      return null;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_KEY}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURI(msg)}&parse_mode=html&disable_web_page_preview=true`;
    return await (await fetch(url)).json();
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  sendMessage,
};
