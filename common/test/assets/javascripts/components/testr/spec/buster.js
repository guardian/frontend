var config = module.exports;

require('buster').stackFilter.filters.push('jasmine.js');

config['require.js 2'] = {
	env: 'browser',
	rootPath: '../',
	autoRun: false,
	libs: [
		'lib/require.js'
	],
	src: [
		'testr.js'
	],
	testHelpers: [
		'lib/jasmine-1.2.0.rc3/jasmine.js',
		'lib/jasmine-buster.js',
		'spec/runner.js'
	],
	specs: [
		'spec/testr.*.spec.js'
	],
	resources: [
		'lib/**/*.js',
		'sibling/**/*.js',
		'src/**/*.js',
		'src/**/*.html',
		'spec/**/*.js',
		'stub/**/*.js'
	]
};
