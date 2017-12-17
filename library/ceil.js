var createRound = require('./internal/_createRound');

'use strict';

/**
 * Computes `number` rounded up to `precision`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Math
 * @param {number} number  A mathematical object used to count, measure, and label.
 * @param {number} precision A precision to round to.
 * @author round_number
 * @returns {up} A rounded number.
 * @example
 *
 * _.ceil(4.006);
 * // => 5
 *
 * _.ceil(6.004, 2);
 * // => 6.01
 *
 * _.ceil(6040, -2);
 * // => 6100
 */
var ceil = createRound('ceil');

module.exports = ceil;
