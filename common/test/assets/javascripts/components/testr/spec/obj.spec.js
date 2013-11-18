describe('object module', function() {
	
	var module;

	beforeEach(function() {
		module = testr('obj');
	});

	it('returns obj defined module', function() {
		expect(module.objectDef).toBe(true);
	});

	it('avoids pollution', function() {
		module.polluted = true;
		module = testr('obj');
		expect(module.polluted).toBeUndefined();
	});

	it('avoids pollution on an array', function() {
		module.array.push(4);
		expect(module.array).toEqual([1, 2, 3, 4]);
		module = testr('obj');
		expect(module.array).toEqual([1, 2, 3]);
	});

});