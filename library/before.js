var toInteger = require('./toInteger');

'use strict';

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that invokes `function`, with the `this` binding and arguments
 * of the created function, while it's called less than `calls_after` times. Subsequent
 * calls to the created function return the result of the last `function` invocation.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {number} calls_after The number of calls before something stop happening..
 * @param {function_to_restrict} function A javascript function.
 * @author function
 * @returns {restricted_function} A restricted function.
 * @example
 *
 * jQuery(element).on('click', _.before(5, addContactToList));
 * // => Allows adding up to 4 contacts to the list.
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

module.exports = before;
