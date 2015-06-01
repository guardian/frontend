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
	"paths": {
		"ophan/ng": "javascripts/test/vendor/ophan.js"
	}
})