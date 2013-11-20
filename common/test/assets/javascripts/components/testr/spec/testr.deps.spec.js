describe('testr with real deps', function() {

	var module;

	beforeEach(function() {
		module = testr('hasdeps');
	});

	it('returns a module', function() {
		expect(module).toBeDefined();
	});

	it('loads module and deps', function() {
		expect(module.dep).toBeDefined();
		expect(module.dep.isDep).toBe(true);
	});

	it('loads deeper deps', function() {
		expect(module.dep.deepDep).toBeDefined();
	});

	it('prevents deep pollution', function() {
		module.dep.deepDep.polluted = true;
		module = testr('hasdeps');
		expect(module.dep.deepDep.polluted).toBeUndefined();
	});

});

describe('testr with stubs', function() {

	var module,
		stubDep = {
			isStubbed: true
		};

	beforeEach(function() {
		module = testr('hasdeps', {
			'isdep': stubDep
		});
	});

	it('works on actual deps', function() {
		expect(module.dep.isStubbed).toBe(true);
	});

	it('keeps unstubbed as real', function() {
		expect(module.objDep.objectDef).toBe(true);
	});

	it('works on nested deps', function() {
		module = testr('hasdeps', {
				'deeper/samedir': stubDep
			});
		expect(module.dep.deepDep.relDep.isStubbed).toBe(true);
	});

	it('doesnt use stub for module under test', function() {
		module = testr('hasdeps', {
			'hasdeps': {
				stubbed: true
			}
		});
		expect(module.stubbed).toBeUndefined();
	});

	it('allows relative paths', function() {
		module = testr('hasdeps', {
			'./isdep': stubDep
		});
		expect(module.dep.isStubbed).toBe(true);
	});
	
});

describe('testr external stub', function() {

	it('is used when flag is present', function() {
		var hasDeps = testr('hasdeps', true);
		expect(hasDeps.dep.isExternalStub).toBe(true);
	});

	it('takes lower priority than the stub object', function() {
		var hasDeps = testr('hasdeps', {
			'isdep': {
				takesPrecedence: true
			}
		}, true);
		expect(hasDeps.dep.takesPrecedence).toBe(true);
		expect(hasDeps.dep.isExternalStub).toBeUndefined();
	});

	it('isnt used for module under test', function() {
		var isDep = testr('isdep', true);
		expect(isDep.isDep).toBe(true);
	});

	it('allows more than one external stub', function() {
		var hasDeps = testr('hasdeps', true);
		expect(hasDeps.objDep.isExternalStub).toBe(true);
	});
	
});