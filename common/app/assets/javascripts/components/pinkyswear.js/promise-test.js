// Tests pinkyswear.js with the Promises / A+ Test Suite (https://github.com/promises-aplus/promises-tests)
// Requires node.js installation.
// Run "npm install promises-aplus-tests" in this dir to install, and then run with "node promise-test.js pinkyswear.js"


var promisesAplusTests = require("promises-aplus-tests");

if (!process.argv[2]) {
	process.stdout.write('Error: Test requires file name as argument (e.g. pinkyswear.js).\n');
	process.exit(1);
}

var pinkySwearSrc = require("./" + process.argv[2]);


function getAdapter(pinkySwear) {
	return adapter = {
			resolved: function(value) { var p = pinkySwear(); p(true, [value]); return p; },
			rejected: function(reason) { var p = pinkySwear(); p(false, [reason]); return p;},
			deferred: function() { 
				var p = pinkySwear();
				return {
					promise: p, 
					resolve: function(value) {
						p(true, [value]);
					},
					reject: function(reason) {
						p(false, [reason]);
					}
				};
			}
		
	};
}

console.log('Testing source...');
var success = true;
promisesAplusTests(getAdapter(pinkySwearSrc), function (err) {
    if (err) 
    	process.exit(2);
});

