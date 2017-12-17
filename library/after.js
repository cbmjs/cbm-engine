var toInteger = require('./toInteger');

'use strict';

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * The opposite of `before`; this method creates a function that invokes
 * `function` once it's called `calls_before` or more times.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {number} calls_before The number of calls before something happens.
 * @param {function_to_restrict} function A javascript function.
 * @author function
 * @returns {restricted_function} A restricted function.
 * @example
 *
 * var saves = ['profile', 'settings'];
 *
 * var done = after(saves.length, function() {
 *   console.log('done saving!');
 * });
 *
 * forEach(saves, function(type) {
 *   asyncSave({ 'type': type, 'complete': done });
 * });
 * // => Logs 'done saving!' after the two async saves have completed.
 */
function after(n, func) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger(n);
  return function() {
    if (--n < 1) {
      return func.apply(this, arguments);
    }
  };
}

module.exports = after;
