/*global requirejs*/
// jscs: disable disallowDanglingUnderscores
var tests = [];
for (var file in window.__karma__.files) {
    if (/.*\.spec\.js$/.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/static/src/javascripts',
    paths: {
        // Test specific paths
        omniture:     '/base/static/src/javascripts/vendor/omniture',
        stripe:       '/base/static/src/javascripts/vendor/stripe/stripe.min',
        squire:       '/base/static/test/javascripts/components/squire/src/Squire',
        fixtures:     '/base/static/test/javascripts/fixtures',
        helpers:      '/base/static/test/javascripts/helpers'
    }
});

require(['dev-config'], function () {
    require(['Promise', 'common/utils/to-array'], function (Promise, toArray) {
        require(tests, function () {
            Promise.all(toArray(arguments)).then(function () {
                window.__karma__.start();
            });
        });
    });
});
