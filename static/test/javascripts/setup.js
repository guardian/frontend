// jscs: disable requireCapitalizedConstructors
// This is the equivalent of the old waitsFor/runs syntax
// which was removed from Jasmine 2
window.waitsForAndRuns = function (escapeFunction, runFunction, escapeTime) {
    // check the escapeFunction every millisecond so as soon as it is met we can escape the function
    var interval = setInterval(function () {
        if (escapeFunction()) {
            clearMe();
            runFunction();
        }
    }, 1);

    // in case we never reach the escapeFunction, we will time out
    // at the escapeTime
    var timeOut = setTimeout(function () {
        clearMe();
        runFunction();
    }, escapeTime || 5000);

    // clear the interval and the timeout
    function clearMe() {
        clearInterval(interval);
        clearTimeout(timeOut);
    }
};

// adding the 'withCredentials' property, so reqwest thinks it can do cors
sinon.FakeXMLHttpRequest.prototype.withCredentials = false;

window.guardian = {
    config: {
        switches: { },
        page: { },
        images: {
            commercial: {}
        }
    },
    css: {}
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
