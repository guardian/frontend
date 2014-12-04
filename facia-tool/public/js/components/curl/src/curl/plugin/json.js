/** MIT License (c) copyright 2010-2013 B Cavalier & J Hann */

/**
 * curl json! plugin
 *
 * Like the text! plugin, will only load same-domain resources.
 */

(function (globalEval) {
define(/*=='curl/plugin/json',==*/ ['./_fetchText'], function (fetchText) {

	var hasJsonParse, missingJsonMsg;

	hasJsonParse = typeof JSON != 'undefined' && JSON.parse;
	missingJsonMsg = 'Cannot use strictJSONParse without JSON.parse';

	return {

		load: function (absId, require, loaded, config) {
			var evaluator, errback;

			errback = loaded['error'] || error;

			// create a json evaluator function
			evaluator = config.strictJSONParse
				? guard(parseSource, loaded, errback)
				: guard(evalSource, loaded, errback);

			// get the text, then eval it
			fetchText(require['toUrl'](absId), evaluator, errback);

		},

		'cramPlugin': '../cram/json'

	};

	function error (ex) {
		throw ex;
	}

	function evalSource (source) {
		return globalEval('(' + source + ')');
	}

	function parseSource (source) {
		if (!hasJsonParse) throw new Error(missingJsonMsg);
		return JSON.parse(source);
	}

	function guard (evaluator, success, fail) {
		return function (source) {
			var value;
			try {
				value = evaluator(source);
			}
			catch (ex) {
				return fail(ex);
			}
			return success(value);
		}
	}

});
}(
	function () {/*jshint evil:true*/ return (1,eval)(arguments[0]); }
));
