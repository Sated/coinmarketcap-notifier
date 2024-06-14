const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { DB_FILE } = require('../constants.js');

const DEFAULT_DATA = {price: {}}; // example { price: { cfx: 0.2, ppi: 0.004 } }
const adapter = new FileSync(DB_FILE);
const cache = low(adapter);
cache.defaults(DEFAULT_DATA).write();

class Cache {
    constructor() {
        this.cache = cache;
    }
}

class PriceCache extends Cache {
    /**
     * Update last price
     * @param {string} slug
     * @param {number} price
     */
    updatePrice(slug, price) {
        this.cache.set(`price.${slug}`, price).write();
    }

    /**
     * Get last price
     * @param {string} slug
     * @returns {number}
     */
    getPrice(slug) {
        return this.cache.get(`price.${slug}`).value();
    }
}

module.exports = {
    priceCache: new PriceCache(),
};
