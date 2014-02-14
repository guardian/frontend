/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl text! cram plugin
 */
define(function (require) {

	var jsEncode = require('./jsEncode');
	var _define = require('./_define');

	return {

		compile: function (pluginId, resId, req, io, config) {
			var absId;

			absId = pluginId + '!' + resId;

			io.read(req.toUrl(resId), function (text) {
				io.write(_define(absId, '', '', '', '"' + jsEncode(text) + '"'));
			}, io.error);
		}

	};

});
