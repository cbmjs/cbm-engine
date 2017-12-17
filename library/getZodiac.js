'use strict';

/**
 * Gets the a birth-date and returns the corresponding astrological sign.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @param {date} date A calendar date is a reference to a particular day represented within a calendar system.
 * @author star_sign
 * @returns {string} A person's astrogical sign.
 */
function getZodiac(date) {
  let temp = new Date(date);
  let zodiac = {
    'Capricorn1': { 'm': 0, 'd': 20 },
    'Aquarius': { 'm': 1, 'd': 19 },
    'Pisces': { 'm': 2, 'd': 20 },
    'Aries': { 'm': 3, 'd': 20 },
    'Taurus': { 'm': 4, 'd': 21 },
    'Gemini': { 'm': 5, 'd': 21 },
    'Cancer': { 'm': 6, 'd': 22 },
    'Leo': { 'm': 7, 'd': 22 },
    'Virgo': { 'm': 8, 'd': 23 },
    'Libra': { 'm': 9, 'd': 23 },
    'Scorpio': { 'm': 10, 'd': 22 },
    'Sagittarius': { 'm': 11, 'd': 21 },
    'Capricorn2': { 'm': 11, 'd': 31 }
  };
  for (let z in zodiac) {
    let endDate = new Date(temp.getFullYear(), zodiac[z].m, zodiac[z].d);
    if (temp <= endDate) {
      return z.replace(/[0-9]/g, '');
    }
  }
}

module.exports = getZodiac;