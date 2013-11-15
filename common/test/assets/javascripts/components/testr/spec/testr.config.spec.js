describe('testr config', function() {

	var origRequire = require;

	afterEach(function() {
		// return to original state
		require = origRequire;
		testr.config({
			specUrl: 'spec',
			stubUrl: 'stub',
			whitelist: []
		});
	});

	it('loads modules from path', function() {
		var module = testr('path');
		expect(module.viaPath).toBe(true);
	});

	it('loads modules from path with parent syntax', function() {
		var module = testr('sibling/pathtarget');
		expect(module.siblingPathTarget).toBe(true);
	});

	it('can disable auto-loading', function() {
		// override
		var origRequire = require,
			called = false;

		// redefine require to capture any calls made
		require = function(req) {
			if (req && req.deps) {
				called = true;
			}
		}

		// configure testr then define a module
		testr.config({
			specUrl: undefined,
			stubUrl: undefined
		});
		define('disableAutoLoad', {});

		expect(called).toBe(false);
	});

	it('allows actual dependencies for white list', function() {
		function getModule() {
			testr('deeper/isdep');
		}

		// configure whitelist
		testr.config({
			whitelist: ['deeper/samedir']
		});

		// the following should not error
		expect(getModule).not.toThrow();
	});

	it('errors when using non-whitelisted actual dependencies', function() {
		function getModule() {
			testr('deeper/isdep');
		}

		// configure whitelist
		testr.config({
			whitelist: ['deeper/someotherdep']
		});

		expect(getModule).toThrow(Error('module must be stubbed: deeper/samedir'));
	});

	it('does not error when stubbing non-whitelisted dependencies', function() {
		function getModule() {
			testr('deeper/isdep', {
				'./samedir': {}
			});
		}
		
		// configure whitelist
		testr.config({
			whitelist: ['deeper/someotherdep']
		});

		// the following should not error
		expect(getModule).not.toThrow();
	});

	it('reports multiple whitelist exceptions', function() {
		function getModule() {
			testr('hasdeps');
		}
		
		// configure whitelist
		testr.config({
			whitelist: ['underscore']
		});

		expect(getModule).toThrow(Error('modules must be stubbed: isdep, obj'));
	});

	it('reports whitelist exceptions on deeper dependencies', function() {
		function getModule() {
			testr('hasdeps');
		}

		// configure whitelist
		testr.config({
			whitelist: ['isdep']
		});

		expect(getModule).toThrow(new Error('modules must be stubbed: deeper/isdep, obj'));
	});

	it('ignores specified modules, using actual from requirejs', function() {
		var module = require('ignore');
		expect(module.ignore).toBe(true);
		module.newprop = 'a';
		module = testr('ignore');
		expect(module.newprop).toBe('a');
	});

});