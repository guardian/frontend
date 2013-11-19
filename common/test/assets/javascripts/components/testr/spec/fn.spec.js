describe('fn module', function() {

	var module;

	beforeEach(function() {
		module = testr('fn');
	});

	it('has spec auto-loaded by testr', function() {
		// running of test proves this
		expect(true).toBe(true);
	});

	it('loads', function() {
		expect(module.functionDef).toBe(true);
	});

	it('avoids pollution', function() {
		module.polluted = true;
		module = testr('fn');
		expect(module.polluted).toBeUndefined();
	});

});