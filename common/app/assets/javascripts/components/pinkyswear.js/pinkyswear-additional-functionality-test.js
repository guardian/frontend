var pinkySwear = require('./pinkyswear');
var assert = require('assert');
var global = new Function("return this")();

describe('additional functionality', function () {
	this.timeout(100);

	it('should pass multiple arguments on to the resolver function (1)', function (done) {

		var p = pinkySwear();
		p(true, [3, 2, 1]);

		p.then(function (r1, r2, r3) {
			assert.equal(r1, 3);
			assert.equal(r2, 2);
			assert.equal(r3, 1);
			done();
		});
	});

	it('should pass multiple arguments on to the resolver function (2)', function (done) {
		var p = pinkySwear();
		p(true);
		p.then(function () {
			var p = pinkySwear();
			p(true, [3, 2, 1]);
			return p;
		})
		.then(function (r1, r2, r3) {
			assert.equal(r1, 3);
			assert.equal(r2, 2);
			assert.equal(r3, 1);
			done();
		});
	});

	it('should use setImmediate if available', function (done) {
		global.setImmediate = done.bind(null,null);
		var p = pinkySwear();
		p(true);
		p.then(function() {  })
	});
});
