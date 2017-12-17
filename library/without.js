var baseDifference = require('./internal/_baseDifference'),
    baseRest = require('./internal/_baseRest'),
    isArrayLikeObject = require('./isArrayLikeObject');

'use strict';

/**
 * Creates an array excluding all given values using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * **Note:** Unlike `_.pull`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {array} array The array to inspect.
 * @param {values} values The values to exclude.
 * @param {xor} boolean_operator
 * @author array
 * @returns {array} Returns the new array of filtered values.
 * @example
 *
 * _.without([2, 1, 2, 3], 1, 2);
 * // => [3]
 */
var without = baseRest(function(array, values) {
  return isArrayLikeObject(array)
    ? baseDifference(array, values)
    : [];
});

module.exports = without;
