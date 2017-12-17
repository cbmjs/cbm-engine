var baseFlatten = require('./internal/_baseFlatten'),
    baseRest = require('./internal/_baseRest'),
    baseUniq = require('./internal/_baseUniq'),
    isArrayLikeObject = require('./isArrayLikeObject');

'use strict';

/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {arrays} arrays The arrays to inspect.
 * @param {or} boolean_operator A boolean operator (e.g and, or etc)
 * @author array
 * @returns {array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */
var union = baseRest(function(arrays) {
  return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});

module.exports = union;
