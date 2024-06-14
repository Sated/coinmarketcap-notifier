const { priceCache } = require('./utils/cache.js');

/**
 * @typedef {Object} Currency
 * @property {number} id - "id" of the currency
 * @property {boolean} watch - Whether the currency should be watched
 * @property {string[]} compareWithSlug - Slugs of the currencies to compare with
 * @property {number} priceFractionDigits - Number of digits after the decimal point for the price
 * @property {function(number): boolean} [condition] - Optional function to check if the given price satisfies a condition
 * @property {string} url - URL of the currency on CoinMarketCap
 */

/**
 * @typedef {Object.<string, Currency>} Currencies
 */

/** @type {Currencies} */
const currencies = {
    'ppi': {
        id: 19544,
        watch: true,
        priceFractionDigits: 5,
        url: 'https://coinmarketcap.com/currencies/swappi-dex/',
        compareWithSlug: ['cfx', 'abc'],
        condition: (price) => {
            const prevPrice = priceCache.getPrice('ppi');
            if (!prevPrice) {
                return true;
            }
            const deviation = prevPrice * 0.01;
            return price < prevPrice - deviation || price > prevPrice + deviation;
        }
    },
    'cfx': {
        id: 7334,
        watch: false,
        priceFractionDigits: 3,
        url: 'https://coinmarketcap.com/currencies/conflux-network/'
    },
    'abc': {
        id: 24497,
        watch: false,
        priceFractionDigits: 3,
        url: 'https://coinmarketcap.com/currencies/abc-pos-pool/'
    }
};

module.exports = {
    currencies
};
