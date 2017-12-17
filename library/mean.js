var baseMean = require('./internal/_baseMean'),
    identity = require('./identity');

'use strict';

/**
 * Computes the mean of the values in `array`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Math
 * @param {array} array The array to iterate over.
 * @author element
 * @returns {mean} Returns the mean value.
 * @example
 *
 * _.mean([4, 2, 8, 6]);
 * // => 5
 */
function mean(array) {
  return baseMean(array, identity);
}

module.exports = mean;
