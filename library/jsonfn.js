/**
* JSONfn - javascript (both node.js and browser) plugin to stringify,
*          parse and clone objects with Functions, Regexp and Date.
*
* Version - 1.1.0
* Copyright (c) Vadim Kiryukhin
* vkiryukhin @ gmail.com
* http://www.eslinstructor.net/jsonfn/
*
* Licensed under the MIT license ( http://www.opensource.org/licenses/mit-license.php )
*
*   USAGE:
*     browser:
*         JSONfn.stringify(obj);
*         JSONfn.parse(str[, date2obj]);
*         JSONfn.clone(obj[, date2obj]);
*
*     nodejs:
*       var JSONfn = require('path/to/json-fn');
*       JSONfn.stringify(obj);
*       JSONfn.parse(str[, date2obj]);
*       JSONfn.clone(obj[, date2obj]);
*
*
*     @obj      -  Object;
*     @str      -  String, which is returned by JSONfn.stringify() function;
*     @date2obj - Boolean (optional); if true, date string in ISO8061 format
*                 is converted into a Date object; otherwise, it is left as a String.
*/

(function (exports) {
	exports.stringify = function (obj) {
		return JSON.stringify(obj, (key, value) => {
			let fnBody;
			if (value instanceof Function || typeof value === "function") {
				fnBody = value.toString();

				if (fnBody.length < 8 || fnBody.slice(0, 8) !== "function") { // This is ES6 Arrow Function
					return `_NuFrRa_${fnBody}`;
				}
				return fnBody;
			}
			if (value instanceof RegExp) {
				return `_PxEgEr_${value}`;
			}
			return value;
		});
	};

	exports.parse = function (str, date2obj) {
		const iso8061 = date2obj ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/ : false;

		return JSON.parse(str, (key, value) => {
			if (typeof value !== "string") {
				return value;
			}
			if (value.length < 8) {
				return value;
			}

			const prefix = value.slice(0, 8);

			if (iso8061 && iso8061.test(value)) {
				return new Date(value);
			}
			/* eslint-disable no-new-func */
			if (prefix === "function") {
				return new Function(`(${value})`);
			}
			if (prefix === "_PxEgEr_") {
				return new Function(value.slice(8));
			}
			if (prefix === "_NuFrRa_") {
				return new Function(value.slice(8));
			}

			return value;
		});
	};

	exports.clone = function (obj, date2obj) {
		return exports.parse(exports.stringify(obj), date2obj);
	};
})(exports);
