/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl legacy cram plugin
 */
define(function (require) {

	var _stringify = require('./_stringify');
	var _define = require('./_define');

	return {

		compile: function (pluginId, resId, req, io, config) {
			var url, exports, requires, dontWrap;

			url = req.toUrl(resId);
			exports = config.exports;
			requires = config.requires;
			dontWrap = config.dontWrapLegacy;

			if (url.substr(url.length - 3) !== ".js") {
				url += ".js";
			}

			io.read(url, function (text) {
				var moduleText;

				if (dontWrap) {
					moduleText = text + ';\n'
						+ _define(resId, requires, '', '', exports);
				}
				else {
					moduleText = _define(resId, requires, '', text, exports);
				}

				io.write(moduleText);

			}, io.error);




		}
	};

});
