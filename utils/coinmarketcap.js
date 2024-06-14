/**
 * Receive price vector from CoinMarketCap
 * @param {number} currencyId - "id" of the cryptocurrency from CoinMarketCap API
 * @returns {Promise<Array<number>>} - price vector
 */
async function fetchPrices(currencyId) {
    const url = `https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart?id=${currencyId}&range=1M`;
    const response = await fetch(url);
    const { data: { points } } = await response.json();

    return Object.values(points).map(point => point['v'][0]);
}

module.exports = { fetchPrices }
