/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

define(function () {
	var map, encodeRx;

	map = { 34: '\\"', 13: '\\r', 12: '\\f', 10: '\\n', 9: '\\t', 8: '\\b' , 92: '\\\\'};
	encodeRx = /["\n\f\t\r\b\\]/g;

	function jsEncode (text) {
		return text.replace(encodeRx, function (c) {
			return map[c.charCodeAt(0)];
		});
	}

	return jsEncode;

});
