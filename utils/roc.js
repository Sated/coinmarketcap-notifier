const { CircularBuffer } = require('./circular-buffer.js')

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
    this.values = new CircularBuffer(period)
  }

  nextValue(value) {
    const outed = this.values.push(value)

    if (outed) {
      return ((value - outed) / outed) * 100
    }
  }

  momentValue(value) {
    const outed = this.values.peek()

    if (outed) {
      return ((value - outed) / outed) * 100
    }
  }
}

module.exports = { Roc }