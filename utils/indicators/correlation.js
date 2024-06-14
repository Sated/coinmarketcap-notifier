const { SMA } = require('./sma.js')
const { CircularBuffer } = require('./circular-buffer.js')

// https://github.com/debut-js/Indicators/blob/master/src/providers/correlation.ts
class Correlation {
    constructor(period) {
        this.period = period;
        this.SMAx = new SMA(this.period);
        this.SMAy = new SMA(this.period);
        this.pricesX = new CircularBuffer(this.period);
        this.pricesY = new CircularBuffer(this.period);
    }
    nextValue(priceX, priceY) {
        this.pricesX.push(priceX);
        this.pricesY.push(priceY);
        this.SMAxValue = this.SMAx.nextValue(priceX);
        this.SMAyValue = this.SMAy.nextValue(priceY);
        let SSxy = 0;
        let SSxx = 0;
        let SSyy = 0;
        for (let i = 0; i < this.period; i++) {
            const xPrice = this.pricesX.toArray()[i];
            const yPrice = this.pricesY.toArray()[i];
            SSxy += (xPrice - this.SMAxValue) * (yPrice - this.SMAyValue);
            SSxx += (xPrice - this.SMAxValue) ** 2;
            SSyy += (yPrice - this.SMAyValue) ** 2;
        }
        return SSxy / Math.sqrt(SSxx * SSyy);
    }
}


/**
 * Receive Correlation vector from vector of numbers
 * @param {Array<number>} seriesA - vector of numbers
 * @param {Array<number>} seriesB - vector of numbers
 * @param {number} period — period of correlation
 * @param {number | undefined} fractionDigits — Number of digits after the decimal point
 * @returns {Array<number>} - roc vector
 */
function getCorrelation(seriesA = [], seriesB = [], period = 2, fractionDigits = 2) {
    const correlation = new Correlation(period)
    const values = seriesA.map((value, index) => correlation.nextValue(value, seriesB[index]))

    if (Boolean(fractionDigits)) {
        return values.map(value => parseFloat(Number(value).toFixed(fractionDigits)))
    }

    return values
}

module.exports = { Correlation, getCorrelation };