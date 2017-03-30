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
        },
        libs: { }
    },
    css: {},
    adBlockers: {
        active: undefined,
        onDetect: []
    }
};

// This is here so that we can polyfill the already converted ES6 stuff without breaking karma tests.
// I've simply pasted in the url because it's temp until karma no longer exists and unlikely to change before then.
var ref = document.getElementsByTagName('script')[0];
var appScript = document.createElement('script');
appScript.src = 'https://assets.guim.co.uk/polyfill.io/v2/polyfill.min.js?rum=0&features=es6,es7,default-3.6&flags=gated&callback=guardianPolyfilled';
ref.parentNode.insertBefore(appScript, ref);
