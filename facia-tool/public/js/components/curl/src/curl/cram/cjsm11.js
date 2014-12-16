/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * cram CommonJS modules/1.1 plugin
 */
define(['../loader/cjsm11'], function (wrapCjsm11) {

	return {
		compile: function (pluginId, resId, req, io, config) {
			var url = req.toUrl(resId);
			if (url.substr(url.length - 3) !== ".js") {
				url += ".js";
			}
			io.read(url, function (text) {
				io.write(wrapCjsm11(text, resId));
			}, io.error);
		}
	};

});
