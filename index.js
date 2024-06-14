const { getRoc } = require('./utils/indicators/roc.js')
const { sendMessage } = require('./utils/telegram.js')
const { fetchPrices } = require('./utils/coinmarketcap.js')
const { priceCache } = require('./utils/cache.js')
const { currencies } = require('./config')
const { MAX_RETRY_COUNT, RETRY_DELAY_MS} = require('./constants.js')

/**
 * Yandex cloud handler
 * https://cloud.yandex.ru/ru/docs/functions/lang/nodejs/
 * @returns {Promise<void>}
 */
const handler = async function () {
    /**
     * Get message
     * @param {string} slug
     * @param {string} [message]
     * @param {boolean} [isCompare]
     * @param {number} [compareIndex]
     * @param {object} [compareData]
     * @returns {Promise<string>}
     */
    const getMessage = async ({ slug, message = '', isCompare = false, ...compareData }) => {
        const { id, condition: conditionsFn, priceFractionDigits, url, compareWithSlug } = currencies[slug];
        const prices = await fetchPrices(id);
        const price = parseFloat(Number(prices.at(-1)).toFixed(priceFractionDigits));
        const roc = getRoc(prices).at(-1);

        if (isCompare) {
            const rocDiff = Math.abs(roc - compareData.roc).toFixed(1);
            message += `\n<a href="${url}">${slug}</a> ${price}$ | ${roc}% | diff ${rocDiff}%`;
        } else if (conditionsFn(price)) {
            message += `<a href="${url}">${slug}</a> ${price}$ | ${roc}%`;
        } else {
            return ''
        }

        const canCompare = compareWithSlug?.length && message
        if (canCompare) {
            for (const compareSlug of compareWithSlug) {
                message = await getMessage({
                    slug: compareSlug,
                    message,
                    isCompare: true,
                    roc,
                });
            }
        }

        priceCache.updatePrice(slug, prices.at(-1));
        return message;
    };

    /**
     * Send message to Telegram
     * @param {string} slug
     * @param {number} [retryCount]
     */
    const sendMessageToTelegram = async ({ slug, retryCount = 0 }) => {
        try {
            const message = await getMessage({ slug });
            await sendMessage(message);
        } catch (error) {
            if (retryCount < MAX_RETRY_COUNT) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
                await sendMessageToTelegram({ slug, retryCount: retryCount + 1 });
            } else {
                await sendMessage(`Error when fetching ${slug}: ${error || 'unknown'}`);
            }
        }
    };

    for (const [slug, params] of Object.entries(currencies)) {
        if (params.watch) {
            await sendMessageToTelegram({ slug });
        }
    }
}

module.exports.handler = handler
