// Make karma asynchronous
window.__karma__.loaded = function () {};

// Load all tests specs through curl
(function () {
    var tests = [],
        specFileExpr = /.*\.spec\.js$/,
        filterTests = document.location.search.match(/[\?\&]test=[a-z]+/gi) || [];

    filterTests = _.map(filterTests, function (test) {
        return test.split('=')[1] + '.spec.js';
    });

    var filterSpecFiles = function (test) {
        return specFileExpr.test(test);
    };
    var filterLoadedTests = filterTests.length ? function (spec) {
        return _.find(filterTests, function (test) {
            return spec.indexOf(test) !== -1;
        });
    } : function () {
        return true;
    };

    tests = _.chain(window.__karma__.files)
        .keys()
        .filter(filterSpecFiles)
        .filter(filterLoadedTests)
        .value();

    curl(tests).then(function () {
        window.__karma__.start();
    });
})();
