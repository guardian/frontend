define(function() {
	var val = 'unpolluted';

	window.polluted = true;

	return {
		functionDef: true,
		polluteVal: function() {
			val = 'polluted';
		},
		getVal: function() {
			return val;
		}
	}
});