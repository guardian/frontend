window.guardian = {
    config: {
        switches: { },
        page: { }
    }
};
/*eslint-disable camelcase*/
window.s_account = 'guardiangu-frontend,guardiangu-network';
/*eslint-enable camelcase*/

window.require = System.amdRequire;

// Configure the test dependencies paths
System.config({
	'paths': {
		'ophan/ng': 'javascripts/test/vendor/ophan.js'
	}
});
