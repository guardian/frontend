// Make karma asynchronous
window.__karma__.loaded = function () {};
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

System.baseURL = '/base/public/';

System.amdRequire([
    'test-config',
    'Promise',
    'underscore'
], function (
    testConfig,
    Promise,
    _
) {
    var tests = [],
        specFileExpr = /.*\.spec\.js$/,
        filterTests = document.location.search.match(/[\?\&]test=[a-z-\.]+/gi) || [];

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
    var prepareForLoad = function (test) {
        return '.' + test.substring(test.indexOf('/spec/')).replace('.js', '');
    };

    tests = _.chain(window.__karma__.files)
        .keys()
        .filter(filterSpecFiles)
        .filter(filterLoadedTests)
        .map(prepareForLoad)
        .value();

    System.import('modules/vars').then(function (vars) {
        vars.init(testConfig);

        Promise.all(_.map(tests, function (test) {
            return System.import(test);
        })).then(function () {
            window.__karma__.start();
        });
    });
});
