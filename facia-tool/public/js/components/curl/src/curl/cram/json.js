/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl json! cram plugin
 */
define(function (require) {

	var _define = require('./define');

	return {

		compile: function (pluginId, resId, req, io, config) {
			var absId;

			absId = pluginId + '!' + resId;

			io.read(
				req.toUrl(resId),
				function (source) {
					var moduleText;
					if (config.strictJSONParse) {
						try { JSON.parse(source); } catch (ex) { io.error(ex); }
					}
					// write-out define(id,function(){return{/* json here */}});
					moduleText = _define(absId, '', '', '', source);
					io.write(moduleText);
				},
				io.error
			);
		}
	};

});
