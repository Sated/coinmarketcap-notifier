const { CircularBuffer } = require("./circular-buffer.js");

class MeanDeviationProvider {
    constructor(period) {
        this.period = period;
        this.values = new CircularBuffer(period);
    }
    nextValue(typicalPrice, average) {
        if (!average) {
            this.values.push(typicalPrice);
            return void 0;
        }
        this.nextValue = this.pureNextValue;
        this.momentValue = this.pureMomentValue;
        return this.pureNextValue(typicalPrice, average);
    }
    momentValue(typicalPrice, average) {
        return void 0;
    }
    pureNextValue(typicalPrice, average) {
        this.values.push(typicalPrice);
        return this.values.toArray().reduce((acc, value) => acc + this.positiveDelta(average, value), 0) / this.period;
    }
    pureMomentValue(typicalPrice, average) {
        const rm = this.values.push(typicalPrice);
        const mean = this.values.toArray().reduce((acc, value) => acc + this.positiveDelta(average, value), 0);
        this.values.pushback(rm);
        return mean / this.period;
    }
    positiveDelta(a, b) {
        return a > b ? a - b : b - a;
    }
}


// https://github.com/debut-js/Indicators/blob/master/src/providers/standard-deviation.ts
class StandardDeviation {
    constructor(period) {
        this.period = period;
        this.values = new CircularBuffer(period);
    }
    nextValue(value, mean = 0) {
        this.values.push(value);
        return Math.sqrt(this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);
    }
    momentValue(value, mean) {
        const rm = this.values.push(value);
        const result = Math.sqrt(this.values.toArray().reduce((acc, item) => acc + (item - mean) ** 2, 0) / this.period);
        this.values.pushback(rm);
        return result;
    }
}

/**
 * Receive Standard Deviation vector from vector of numbers
 * @param {Array<number>} series - vector of numbers
 * @param {number} period — period of std dev
 * @param {number | undefined} fractionDigits — Number of digits after the decimal point
 * @returns {Array<number>}
 */
function getStdDev(series = [], period = 8, fractionDigits = 3) {
    const stdDev = new StandardDeviation(period)
    const values = series.map((value, index) => stdDev.nextValue(value))

    if (Boolean(fractionDigits)) {
        return values.map(value => parseFloat(Number(value).toFixed(fractionDigits)))
    }

    return values
}

module.exports = { StandardDeviation, getStdDev }