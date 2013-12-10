/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl legacy cram plugin
 */
define(function (require) {

	var _stringify = require('./_stringify');
	var _define = require('./_define');

	return {

		compile: function (pluginId, resId, req, io, config) {
			var moduleId, filename, exports, requires, dontWrap;

			moduleId = filename = resId;
			exports = config.exports;
			requires = config.requires;
			dontWrap = config.dontWrapLegacy;

			if (filename.substr(filename.length - 3) !== ".js") {
				filename += ".js";
			}

			io.read(filename, function (text) {
				var moduleText;

				if (dontWrap) {
					moduleText = text + ';\n'
						+ _define(moduleId, requires, '', '', exports);
				}
				else {
					moduleText = _define(moduleId, requires, '', text, exports);
				}

				io.write(moduleText);

			}, io.error);




		}
	};

});
