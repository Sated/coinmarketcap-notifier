const { CircularBuffer } = require("./circular-buffer.js");
const {ROC_PERIOD_H} = require("../../constants");

/**
 * https://github.com/debut-js/Indicators/blob/master/src/roc.ts
 * The Rate-of-Change (Roc) indicator, which is also referred to as simply Momentum,
 * is a pure momentum oscillator that measures the percent change in price from one period to the next.
 * The Roc calculation compares the current price with the price “n” periods ago.
 * The plot forms an oscillator that fluctuates above and below the zero line as the Rate-of-Change moves from positive to negative.
 * As a momentum oscillator, Roc signals include centerline crossovers, divergences and overbought-oversold readings.
 * Divergences fail to foreshadow reversals more often than not, so this article will forgo a detailed discussion on them.
 * Even though centerline crossovers are prone to whipsaw, especially short-term,
 * these crossovers can be used to identify the overall trend.
 * Identifying overbought or oversold extremes comes naturally to the Rate-of-Change oscillator.
 **/
class Roc {
  constructor(period = 5) {
    this.values = new CircularBuffer(period);
  }

  nextValue(value) {
    const outed = this.values.push(value);

    if (outed) {
      return ((value - outed) / outed) * 100;
    }
  }

  momentValue(value) {
    const outed = this.values.peek();

    if (outed) {
      return ((value - outed) / outed) * 100;
    }
  }
}

/**
 * Receive Rate of Change vector from vector of numbers
 * @param {Array<number>} series - vector of numbers
 * @param {number} period — period of roc
 * @param {number | undefined} fractionDigits — Number of digits after the decimal point
 * @returns {Array<number>} - roc vector
 */
function getRoc(series = [], period = ROC_PERIOD_H, fractionDigits = 1) {
  const roc = new Roc(period)
  const values = series.map(value => roc.nextValue(value))

  if (Boolean(fractionDigits)) {
    return values.map(value => parseFloat(Number(value).toFixed(fractionDigits)))
  }

  return values
}

module.exports = { Roc, getRoc };
