var arrayFilter = require('./internal/_arrayFilter'),
    baseRest = require('./internal/_baseRest'),
    baseXor = require('./internal/_baseXor'),
    isArrayLikeObject = require('./isArrayLikeObject');

'use strict';

/**
 * Creates an array of unique values that is the
 * [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
 * of the given arrays. The order of result values is determined by the order
 * they occur in the arrays.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Array
 * @param {arrays} arrays The arrays to inspect.
 * @param {xor} boolean_operator A boolean operator (e.g and, or etc)
 * @author array
 * @returns {array} Returns the new array of filtered values.
 * @example
 *
 * _.xor([2, 1], [2, 3]);
 * // => [1, 3]
 */
var xor = baseRest(function(arrays) {
  return baseXor(arrayFilter(arrays, isArrayLikeObject));
});

module.exports = xor;
