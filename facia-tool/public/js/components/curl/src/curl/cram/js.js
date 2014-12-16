/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl js! cram plugin
 */
define(function (require) {

	var _define = require('./_define');

	var stripOrderOptionRx = /!order/;

	return {

		normalize: function (resourceId, toAbsId) {
			// Remove !order option.  It's not needed in a bundle.
			// !exports option must be preserved so that it will be
			// passed to the compile() method.
			return resourceId
				? toAbsId(resourceId.replace(stripOrderOptionRx, ''))
				: resourceId;
		},

		compile: function (pluginId, resId, req, io /*, config*/) {
			var absId, exportsPos, bangPos, exports, url;

			absId = pluginId + '!' + resId;
			exportsPos = resId.indexOf('!exports=');
			exports = exportsPos > 0 && resId.substr(exportsPos + 9); // must be last option!
			bangPos = resId.indexOf('!');
			if (bangPos >= 0) resId = resId.slice(0, bangPos);

			url = req.toUrl(resId);
			if (url.substr(url.length - 3) !== ".js") {
				url += ".js";
			}

			io.read(url, function (text) {
				var moduleText;

				moduleText = text + ';\n'
					+ _define(absId, '', '', '', exports);

				io.write(moduleText);

			}, io.error);
		}

	};

});
