window.guardian = {
    config: {
        switches: { },
        page: { }
    }
};
window.s_account = 'guardiangu-frontend,guardiangu-network';

window.require = System.amdRequire;

// Configure the test dependencies paths
System.config({
	'paths': {
		'ophan/ng': 'javascripts/test/vendor/ophan.js'
	}
});

// Helper for async tests using promises
// Mocha supports promises, Jasmine doesn't…
// https://github.com/jasmine/jasmine/issues/681
var partialItPromise = function (it, description, fn) {
    it(description, function (done) {
        fn().then(done, done.fail);
    });
};

window.itPromise = partialItPromise.bind(null, it);
// Exclusive run
window.fitPromise = partialItPromise.bind(null, fit);
