/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * cram CommonJS modules/1.1 plugin
 */
define(['./jsEncode', '../loader/cjsm11'], function (jsEncode, wrapCjsm11) {

	return {
		compile: function (pluginId, resId, req, io, config) {
			io.read(resId, function (text) {
				io.write(jsEncode(wrapCjsm11(text, resId)));
			}, io.error);
		}
	};

});
