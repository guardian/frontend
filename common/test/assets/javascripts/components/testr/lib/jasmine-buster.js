/**
 * jasmine-buster 0.1.0
 * https://www.github.com/mattfysh/jasmine-buster
 * Distributed under the MIT license
 */

(function() {
	// iterator
	function each(coll, callback) {
		var l = coll.length;
		for (var i = 0; i < l; i += 1) {
			callback(coll[i]);
		}
	}

	// reporter constructor
	jasmine.BusterReporter = function(options) {}

	// runner has complete, pass results to buster
	jasmine.BusterReporter.prototype.reportRunnerResults = function(runner) {
		// format the results into the buster test case format
		var suites = runner.topLevelSuites();

		function createSuiteDefinition(suite) {
			var def = {};
			each(suite.children(), function(child) {
				def[child.description] = child instanceof jasmine.Spec ?
					createSpec(child) :
					createSuiteDefinition(child);
			});
			return def;
		}

		function createSpec(spec) {
			var items = spec.results().getItems();
			return function() {
				each(items, function(item) {
					var err = item.trace;

					if (!item.passed()) {
						if (err instanceof Error === false) {
							err = item.message.split(': ');
							err = new window[err[0]](err[1]);
							err.stack = item.trace.stack;
						}
						throw err;
					}
					assert(true);
				});
			}
		}

		each(suites, function(suite) {
			var def = createSuiteDefinition(suite);
			buster.testCase(suite.description, def);
		});

		// send the results to buster
		buster.run();
	}
}());