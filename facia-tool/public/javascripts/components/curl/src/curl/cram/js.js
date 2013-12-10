/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl js! cram plugin
 *
 * TODO: figure out when to return window.<exported-thing> vs. global.<exported-thing> vs just <exported-thing>
 */
define(['./jsEncode'], function (jsEncode) {
	var stripOrderOptionRx;

	stripOrderOptionRx = /!order/;

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
			var absId, exportsPos, bangPos, exports;

			absId = pluginId + '!' + resId;
			exportsPos = resId.indexOf('!exports=');
			exports = exportsPos > 0 && resId.substr(exportsPos + 9); // must be last option!
			bangPos = resId.indexOf('!');
			if (bangPos >= 0) resId = resId.slice(0, bangPos);

			io.read(resId, function (text) {
				var moduleText;

				moduleText = jsEncode(text) + ';\n'
					+ 'define("' + absId + '", function () {\n';

				moduleText += exports
					? '\treturn ' + exports
					: '\treturn void 0';

				moduleText += ';\n});\n';

				io.write(moduleText);

			}, io.error);
		}

	};

});
