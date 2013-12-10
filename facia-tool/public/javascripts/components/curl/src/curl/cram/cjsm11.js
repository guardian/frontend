/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * cram CommonJS modules/1.1 plugin
 */
define(['../loader/cjsm11'], function (wrapCjsm11) {

	return {
		compile: function (pluginId, resId, req, io, config) {
			var moduleId = resId;
			if (resId.substr(resId.length - 3) !== ".js") {
				resId += ".js";
			}
			io.read(resId, function (text) {
				io.write(wrapCjsm11(text, moduleId));
			}, io.error);
		}
	};

});
