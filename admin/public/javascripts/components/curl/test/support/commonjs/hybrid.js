define(function (require, exports, module) {

	var foo = require('./module');
	exports.foo = function () { return foo; };

});
