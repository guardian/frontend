var build = require('../lib/build');
var cli   = require('../lib/cli');


// Some CLI tests
exports.testReadConfigFile = function(test) {
	cli.readConfigFile('test/config.json', function(config) {
	    test.equal(config.length, 2);
	    test.done();
	});
};

// Build tests
exports.testBuildFontFaceRule = function(test) {
	var input = [{
		'font-family': 'test1',
		'font-weight': 'test2',
		'font-style': 'test3',
		'font-stretch': 'test4',
		'font-variant': 'test5',
		'font-feature-settings': 'test6',
		'base64': 'test7',
		'format': 'woff',
	}]
	var output = '@font-face{font-family:test1;src:url(data:application/x-font-woff;base64,test7);font-weight:test2;font-style:test3;font-stretch:test4;font-variant:test5;font-feature-settings:test6;}';
	var css = build.buildFontFaceRule(input);
	test.equal(css, output);
	test.done();
}


exports.testBuildFontFaceRuleWithDefaults = function(test) {
	var input = [{
		'font-family': 'test1',
		'base64': 'test2',
		'format': 'woff',
	}]
	var output = '@font-face{font-family:test1;src:url(data:application/x-font-woff;base64,test2);}';
	var css = build.buildFontFaceRule(input);
	test.equal(css, output);
	test.done();
}