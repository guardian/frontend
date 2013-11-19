(function() {
	// add buster reporter
	var env = jasmine.getEnv(),
		busterReporter = new jasmine.BusterReporter();

	// add buster reporter
	env.addReporter(busterReporter);

	// configure testr.js
	testr.config({
		baseUrl: 'src',
		specUrl: 'spec',
		stubUrl: 'stub',
		ignore: ['ignore']
	});

	// run testr.js
	testr.run('main', function() {
		// run tests
		env.execute();
	});

	// begin module verification after first round of testing
	busterReporter.reportRunnerResults = function() {
		var rconf = window.rconf,
			actuals;

		testr.restore();
		rconf.context = 'actuals';
		rconf.baseUrl = 'src';
		actuals = require(rconf);
		console.warn('requesting', rconf);
		actuals(rconf.deps, function() {
			// setup a test for each module
			describe('module verification', function() {
				var len = rconf.deps.length;
				for (var i = 0; i < len; i += 1) {
					var moduleName = rconf.deps[i];
					it(moduleName, function() {
						expect(testr(moduleName)).toEqual(actuals(moduleName));
					});
				}
			});

			// expose the prototype function
			delete busterReporter.reportRunnerResults;

			// execute the module verification tests
			env.execute();
		});
	};

}());