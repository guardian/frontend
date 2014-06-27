/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl css! plugin build-time module
 */
define(['./jsEncode'], function (jsEncode) {
	"use strict";

	var templateWithRuntimeModule, templateWithRuntimePlugin, templateRx,
		nonRelUrlRe, findUrlRx, commaSepRx;

	templateWithRuntimeModule = 'define("${absId}", ["${runtime}", "require"], function (injector, require) { var text = "${text}"; if (${translateUrls}) text = injector.translateUrls(text, require.toUrl("")); return injector(text); });\n';
	templateWithRuntimePlugin = 'define("${resourceId}", ["${runtime}", "require"], function (injector, require) { var text = "${text}"; if (${translateUrls}) text = injector.translateUrls(text, require.toUrl("")); return text; });\n' +
		'define("${absId}", ["${runtime}!${resourceId}"], function (sheet) { return sheet; });\n';
	templateRx = /\$\{([^}]+)\}/g;
	commaSepRx = /\s*,\s*/g;

	// tests for absolute urls and root-relative urls
	nonRelUrlRe = /^\/|^[^:]*:\/\//;
	// Note: this will fail if there are parentheses in the url
	findUrlRx = /url\s*\(['"]?([^'"\)]*)['"]?\)/g;

	return {

		normalize: function (resourceId, normalize) {
			var resources, normalized;

			if (!resourceId) return resourceId;

			resources = resourceId.split(commaSepRx);
			normalized = [];

			for (var i = 0, len = resources.length; i < len; i++) {
				normalized.push(normalize(resources[i]));
			}

			return normalized.join(',');
		},

		compile: function (pluginId, resId, req, io, config) {
			var cssWatchPeriod, cssNoWait, template, resources, baseUrl, eachId;

			cssWatchPeriod = parseInt(config['cssWatchPeriod']) || 50;
			cssNoWait = config['cssNoWait'];
			template = cssNoWait
				? templateWithRuntimeModule
				: templateWithRuntimePlugin;
			resources = (resId || '').split(commaSepRx);

			baseUrl = req.toUrl('');

			while ((eachId = resources.shift())) templatize(eachId);

			function templatize (resId) {
				var absId, url, idPath;

				absId = pluginId + '!' + resId;
				url = req.toUrl(resId);
				if (url.substr(url.length - 4) !== ".css") {
					url += ".css";
				}
				idPath = path(resId);

				io.read(url, function (text) {
					var changed, moduleText;

					text = text.replace(findUrlRx, function (all, url) {
						// adjust any relative url to an id, translate it to a url
						// via require.toUrl, then make it relative to baseUrl.
						var translated = makeRelative(req.toUrl(translateId(url, idPath)), baseUrl);
						changed |= translated != url;
						return 'url("' + translated + '")';
					});

					moduleText = replace(
						template,
						{
							absId: absId,
							runtime: 'curl/plugin/style',
							translateUrls: changed ? '1' : '0',
							resourceId: resId,
							text: jsEncode(text)
						}
					);

					io.write(moduleText);

				}, io.error);

			}
		}

	};

	function replace (text, values) {
		return text.replace(templateRx, function (m, id) {
			return values[id];
		});
	}

	function translateId (url, baseUrl) {
		// if this is a relative url
		if (!nonRelUrlRe.test(url)) {
			// append path onto it
			url = reduceDots(baseUrl + url);
		}
		return url;
	}

	function path (id) {
		var pos;
		// extracts the path bits from an id
		pos = id.lastIndexOf('/');
		return pos >= 0 ? id.substr(0, pos) + '/' : id;
	}

	function reduceDots (id) {
		// remove any dots from the inside of an id
		// remove path-segment/../ or /./
		return id.replace(/(^|\/)[^\/\.]+\/\.\.\/|\/\.\//, '/');
	}

	function makeRelative (url, parentUrl) {
		// make this url relative to a parent url
		return url.replace(new RegExp('^' + parentUrl), '');
	}

});

/*
define('some/id.css', function () {
	return '.foo { display: none; }';
});

define('curl/plugin/css!some/id.css', ['curl/plugin/style!some/id.css', 'curl/plugin/style'], function (sheet) {
	return sheet;
});
*/
