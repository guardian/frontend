// http://jasmine.github.io/2.0/introduction.html#section-43
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

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
