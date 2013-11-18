describe('testr errors when', function() {

	it('module name does not exist', function() {
		function getUndefinedModule() {
			return testr('notdefined');
		}
		expect(getUndefinedModule).toThrow(Error('module has not been loaded: notdefined'));
	});

	it('module name is not a string', function() {
		function getNonString() {
			return testr({});
		}
		expect(getNonString).toThrow(Error('module name must be a string'));
	});

	it('stubs are not given as an object', function() {
		function giveStubsAsFunction(){
			return testr('obj', function() {});
		};

		function giveStubsAsArray() {
			return testr('obj', [1, 2]);
		};

		expect(giveStubsAsFunction).toThrow(Error('stubs must be given as an object'));
		expect(giveStubsAsArray).toThrow(Error('stubs must be given as an object'));
	});

});