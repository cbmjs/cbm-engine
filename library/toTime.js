'use strict';

/**
 * Gets a date and retuns the timestamp of the number of seconds that have elapsed from that date since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @param {date} date
 * @author time
 * @returns {seconds} The concept of time.
 */
function toTime(date) {
  let temp = new Date(date);
  return (temp.getTime() / 1000);
}

module.exports = toTime;