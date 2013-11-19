define(function() {
	var o = {};

	o.load = function() {
		require(['obj'], function(obj) {
			o.obj = obj;
		});
	};

	return o;
});