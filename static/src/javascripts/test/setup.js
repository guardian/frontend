// http://jasmine.github.io/2.0/introduction.html#section-43
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

window.guardian = {
    config: {
        switches: { },
        page: { },
        tests: { }
    }
};

// Omniture variables expected on the page

/*eslint-disable camelcase*/
window.s_account = 'guardiangu-network';
/*eslint-enable camelcase*/

/*eslint-disable no-unused-vars*/
window.s = {
    tl: function (a, b, c) {

    }
};
/*eslint-enable no-unused-vars*/

window.require = System.amdRequire;
