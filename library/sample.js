var arraySample = require('./internal/_arraySample'),
    baseSample = require('./internal/_baseSample'),
    isArray = require('./isArray');

'use strict';

/**
 * Gets a random element from `collection`.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Collection
 * @param {array} array The collection to sample.
 * @author element
 * @returns {random} Returns the random element.
 * @example
 *
 * _.sample([1, 2, 3, 4]);
 * // => 2
 */
function sample(collection) {
  var func = isArray(collection) ? arraySample : baseSample;
  return func(collection);
}

module.exports = sample;
