require('dotenv').config()
const { Roc } = require('./utils/roc.js')

if (!process.env.TELEGRAM_BOT_KEY) {
    console.error('Telegram Bot API key doesnt exist')
    process.exit(1)
}

if (!process.env.TELEGRAM_CHAT_ID) {
    console.error('Telegram chat id doesnt exist')
    process.exit(1)
}

const TELEGRAM_BOT_KEY = process.env.TELEGRAM_BOT_KEY
const TELEGRAM_CHAT_ID = parseInt(process.env.TELEGRAM_CHAT_ID)
const ROC_PERIOD_H = 24 // 24h
const MAX_RETRY_COUNT = 1
const RETRy_DELAY_MS = 1500
const LOCK_MESSAGE_OFFSET_MS = 2 * 60 * 60 * 1000 // 2h

/**
 * @typedef Currency
 * @type {Object}
 * @property {number} id - "id" of the currency
 * @property {boolean} watch - the currency should be watched
 * @property {function(number, number): boolean} [condition] - Optional function to check if the given price and rate of change (roc) satisfy a condition
 */

/**
 * @typedef Currencies
 * @type {Object.<string, Currency>}
 */

/** @type {Currencies} */
const currencies = {
    'swappi': {
        id: 19544, // https://coinmarketcap.com/currencies/swappi-dex/
        watch: true,
        url: 'https://coinmarketcap.com/currencies/swappi-dex/',
        condition: (price, roc) => {
            return price > 0.0081 ||
                price < 0.0074 ||
                roc > 10;
        }
    },
    'cfx': {
        id: 7334,
        url: 'https://coinmarketcap.com/currencies/conflux-network/',
        watch: false
    }
}

/**
 * Send message to Telegram
 * @param {string} msg - The text of the message
 * @returns Promise<any>
 */
async function sendMessage(msg = '') {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_KEY}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURI(msg)}&parse_mode=html&disable_web_page_preview=true`;
    return (await (await fetch(url)).json())
}

/**
 * The last message was sent
 * more than "LOCK_MESSAGE_OFFSET_MS" ago
 * @param {string} slug - "slug" of cryptocurrency from coinmarketcap api
 * @returns {Promise<boolean>}
 */
async function canMessageSend(slug) {
    try {
        if (!canMessageSend.cachedResult) {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_KEY}/getUpdates`
            const {result} = await (await fetch(url)).json()

            canMessageSend.cachedResult = result.reverse()
            canMessageSend.cachedResult = canMessageSend.cachedResult.filter(({channel_post}) => Boolean(channel_post))
        }

        for (const {channel_post: {chat, date, text}} of canMessageSend.cachedResult) {
            if (chat.id !== TELEGRAM_CHAT_ID) continue
            if (!text.includes(`${slug} |`)) continue
            const messageDate = new Date(date * 1000)
            const dateWithLockOffset = new Date(Date.now() - LOCK_MESSAGE_OFFSET_MS);
            return messageDate < dateWithLockOffset
        }

        return true
    } catch {
        return true
    }
}

/**
 * Recieve price vector from coinmarketcap
 * @param {number} currencyId - "id" of the cryptocurrency from coinmarketcap api
 * @returns {Promise<Array<number>>} - price vector
 */
async function fetchPrices(currencyId) {
    const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${currencyId}&range=1M`
    const {data: {points}} = await (await fetch(url)).json()
    const prices = []
    for (const [key, value] of Object.entries(points)) {
        const [price, volume] = value['v']
        prices.push(price)
    }
    return prices;
}

const handler = async function () {
    async function checkConditionForCurrency(id, slug, retryCount = 0) {
        try {
            const prices = await fetchPrices(id)
            const roc = new Roc(ROC_PERIOD_H)
            const lastPrice = parseFloat(Number(prices.at(-1)).toFixed(5))
            const lastRocValue = parseFloat(Number(prices.map(price => roc.nextValue(price)).at(-1)).toFixed(2))

            const conditionsFn = currencies[slug].condition
            if (conditionsFn(lastPrice, lastRocValue)) {
                if (await canMessageSend(slug)) {
                    let message = `<a href="${currencies[slug].url}">${slug}</a> | ${lastPrice}$ | ${(lastRocValue > 0) ? '+' : ''}${lastRocValue}%`

                    if (slug === 'swappi') {
                        const cfxLastPrice = (await fetchPrices(currencies.cfx.id))?.at(-1).toFixed(3)

                        if (Boolean(cfxLastPrice)) {
                            message += ` | cfx ${cfxLastPrice}$`
                        }
                    }

                    await sendMessage(message)
                }
            }
        } catch (error) {
            if (retryCount < MAX_RETRY_COUNT) {
                await new Promise((resolve) => setTimeout(resolve, RETRy_DELAY_MS))
                await checkConditionForCurrency(id, slug, retryCount + 1)
            } else {
                await sendMessage(`Error when fetching ${slug}: ${error || 'unknown'}`)
            }
        }
    }

    for (const [currencySlug, currencyParams] of Object.entries(currencies)) {
        if (!currencyParams.watch) continue
        const currencyId = currencyParams.id
        await checkConditionForCurrency(currencyId, currencySlug)
    }
}

// https://cloud.yandex.ru/ru/docs/functions/lang/nodejs/
exports.handler = handler