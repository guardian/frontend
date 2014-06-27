/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl locale! plugin
 *
 * This is a very light localization plugin that gets inserted into AMD bundles
 * by cram.js.  Its functionality is nearly identical to the i18n! plugin.
 * The only difference of significance is that the locale! plugin initially
 * assumes that the module for the i18n strings is already loaded.  If the
 * module is not loaded (and config.locale != false), it invokes the i18n!
 * plugin to fetch it and assemble it.
 *
 * You probably don't want to use this plugin directly.  You likely want the
 * i18n! plugin.  Just sayin.
 *
 */
define(/*=='curl/plugin/locale',==*/ function () {

	var appendLocaleRx;

	// finds the end and an optional .js extension since some devs may have
	// added it, which is legal since plugins sometimes require an extension.
	appendLocaleRx = /(\.js)?$/;

	getLocale['toModuleId'] = toModuleId;
	getLocale['load'] = load;

	return getLocale;

	/**
	 * Sniffs the current locale.  In environments that don't have
	 * a global `window` object, no sniffing happens and false is returned.
	 * You may also skip the sniffing by supplying an options.locale value.
	 * @param {Object} [options]
	 * @param {String|Boolean|Function} [options.locale] If a string, it is
	 * assumed to be a locale override and is returned.  If a strict false,
	 * locale sniffing is skipped and false is returned. If a function, it is
	 * called with the same signature as this function and the result returned.
	 * @param {String} [absId] the normalized id sent to the i18n plugin.
	 * @returns {String|Boolean}
	 */
	function getLocale (options, absId) {
		var locale, ci, lang;

		if (options) {
			locale = options['locale'];
			// if locale is a function, use it to get the locale
			if (typeof locale == 'function') locale = locale(options, absId);
			// just return any pre-configured locale.
			if (typeof locale == 'string') return locale;
		}

		// bail if we're server-side
		if (typeof window == 'undefined') return false;

		// closure doesn't seem to know about recent DOM standards
		ci = window['clientInformation'] || window.navigator;
		lang = ci && (ci.language || ci['userLanguage']) || '';
		return lang.toLowerCase();
	}

	function toModuleId (defaultId, locale) {
		var suffix = locale ? '/' + locale  : '';
		return defaultId.replace(appendLocaleRx, suffix + '$&');
	}

	function load (absId, require, loaded, config) {
		var locale, toId, bundleId, defaultId;

		// figure out the locale and bundle to use
		locale = getLocale(config, absId);
		toId = config['localeToModuleId'] || toModuleId;
		bundleId = locale ? toId(absId, locale) : absId;

		try {
			// try to get a bundle that's already loaded (sync require)
			loaded(require(bundleId));
		}
		catch (ex) {
			// try default bundle sync (unless we've already tried it)
			defaultId = locale ? toId(absId, false) : absId;
			if (defaultId == bundleId) return fail();

			try {
				loaded(require(defaultId));
			}
			catch (ex) {
				// locale === true, try to use the i18n plugin
				if (locale !== true) return fail();
				require(['i18n!' + absId], loaded, fail);
			}
		}

		function fail () {
			var ex = new Error('Unable to find correct locale for ' + absId);
			if (loaded.error) loaded.error(ex);
			else throw ex;
		}
	}

});
