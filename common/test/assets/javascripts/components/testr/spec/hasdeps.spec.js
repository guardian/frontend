describe('hasdeps module', function() {

	var module;

	function getStubs() {
		var stubDep  = {
				isStubbed: true
			};
		
		return {
			'isdep': stubDep
		};
	}

	beforeEach(function() {
		module = testr('hasdeps', getStubs());
	});

	it('can be loaded with stubbed dep', function() {
		expect(module.dep.isStubbed).toBe(true);
	});

	it('avoids pollution on stub', function() {
		module.dep.polluted = true;
		module = testr('hasdeps', getStubs());
		expect(module.dep.polluted).toBeUndefined();
	});

});