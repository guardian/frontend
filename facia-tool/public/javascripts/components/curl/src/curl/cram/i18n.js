/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl i18n! cram plugin
 */
define(function (require) {

	var i18n = require('../plugin/i18n');
	var getLocale = require('../plugin/locale');
	var _stringify = require('./_stringify');
	var _define = require('./_define');

	function bundleToString (thing) {
		return _stringify(thing);
	}

	bundleToString.compile = function (pluginId, resId, req, io, config) {
		var toId, i18nId, localeId, locales, output, count;

		toId = config['localeToModuleId'] || getLocale.toModuleId;
		i18nId = pluginId + '!' + resId;
		// toId() on localeId ensure it is output the same as other locales
		localeId = toId('curl/plugin/locale!' + resId, '');
		locales = config.locales || [];
		if (locales.indexOf('') < 0) locales.push(''); // add default bundle
		output = [];
		count = locales.length;

		// use the load method of the run-time plugin, capturing bundles.
		locales.forEach(function (locale, i) {
			var cfg;

			loaded.error = stop;
			// inherit from config so we can extend it for this load
			cfg = Object.create(config);
			// load bundle with this locale
			cfg.locale = locale;
			i18n.load(resId, req, loaded, cfg);

			function loaded (bundle) {
				// each bundle captured is output as a locale!id module, e.g.:
				// define("locale!foo/en-us", function () {
				//   return {/*...*/};
				// });
				output[i] = _define(
					toId(resId, locale), '', '', '', bundleToString(bundle)
				);
				if (--count == 0) done();
			}
		});

		if (!locales.length) done();

		function stop (ex) {
			io.warn(ex.message);
			if (--count == 0) done();
		}

		function done () {
			// add the default i18n bundle module which uses the locale!
			// plugin to require() or fetch the correct bundle. e.g.
			// define("i18n!foo/en", ["locale!foo/en"], function (bundle) {
			//   return bundle;
			// });
			output.push(_define(i18nId, [localeId], ['bundle'], '', 'bundle'));
			io.write(output.join(''));
		}

	};

	return bundleToString;

});
