// load polyfills if browser is ancient
if (!guardian.config.isModernBrowser) {
	define([guardian.js.modules.guardianUtils, "qwery", "$dom"], function(utils, qwery, $dom) {
		var $g = utils.init(qwery, $dom);
		return $g;
	});
} else {
	define([guardian.js.modules.guardianUtils], function(utils) {
		var $g = utils.init();
		return $g;
	});
}