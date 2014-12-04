/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl CommonJS Modules/1.1 loader
 *
 * This loader loads modules that conform to the CommonJS Modules/1.1 spec.
 * The loader also accommodates node.js, which  adds features beyond the
 * spec, such as `module.exports` and `this === exports`.
 *
 * CommonJS modules can't run in browser environments without help. This
 * loader wraps the modules in AMD and injects the CommonJS "free vars":
 *
 * define(function (require, exports, module) {
 *     // CommonJS code goes here.
 * });
 *
 * Config options:
 *
 * `injectSourceUrl` {boolean} If truthy (default), a //@sourceURL is injected
 * into the script so that debuggers may display a meaningful name in the
 * list of scripts. Setting this to false may save a few bytes.
 *
 * `injectScript` {boolean} If truthy, a <script> element will be inserted,
 * rather than using a global `eval()` to execute the module.  You typically
 * won't need to use this option.
 *
 * `dontAddFileExt` {RegExp|string} An expression that determines when *not*
 * to add a '.js' extension onto a url when fetching a module from a server.
 */

(function (global, document, globalEval) {

define(/*=='curl/loader/cjsm11',==*/ ['../plugin/_fetchText', 'curl/_privileged'], function (fetchText, priv) {

	var head, insertBeforeEl, extractCjsDeps, checkToAddJsExt;

	head = document && (document['head'] || document.getElementsByTagName('head')[0]);
	// to keep IE from crying, we need to put scripts before any
	// <base> elements, but after any <meta>. this should do it:
	insertBeforeEl = head && head.getElementsByTagName('base')[0] || null;

	extractCjsDeps = priv['core'].extractCjsDeps;
	checkToAddJsExt = priv['core'].checkToAddJsExt;

	function wrapSource (source, resourceId, fullUrl) {
		var sourceUrl = fullUrl ? '////# sourceURL=' + fullUrl.replace(/\s/g, '%20') + '' : '';
		return "define('" + resourceId + "'," +
			"['require','exports','module'],function(require,exports,module,define){" +
			source + "\n});\n" + sourceUrl + "\n";
	}

	var injectSource = function (el, source) {
		// got this from Stoyan Stefanov (http://www.phpied.com/dynamic-script-and-style-elements-in-ie/)
		injectSource = ('text' in el) ?
			function (el, source) { el.text = source; } :
			function (el, source) { el.appendChild(document.createTextNode(source)); };
		injectSource(el, source);
	};

	function injectScript (source) {
		var el = document.createElement('script');
		injectSource(el, source);
		el.charset = 'utf-8';
		head.insertBefore(el, insertBeforeEl);
	}

	wrapSource['load'] = function (resourceId, require, callback, config) {
		var errback, url, sourceUrl;

		errback = callback['error'] || function (ex) { throw ex; };
		url = checkToAddJsExt(require['toUrl'](resourceId), config);
		sourceUrl = config['injectSourceUrl'] !== false && url;

		fetchText(url, function (source) {
			var moduleMap;

			// find (and replace?) dependencies
			moduleMap = extractCjsDeps(source);

			// get deps
			require(moduleMap, function () {


				// wrap source in a define
				source = wrapSource(source, resourceId, sourceUrl);

				if (config['injectScript']) {
					injectScript(source);
				}
				else {
					//eval(source);
					globalEval(source);
				}

				// call callback now that the module is defined
				callback(require(resourceId));

			}, errback);
		}, errback);
	};

	wrapSource['cramPlugin'] = '../cram/cjsm11';

	return wrapSource;

});

}(this, this.document, function () { /* FB needs direct eval here */ eval(arguments[0]); }));
