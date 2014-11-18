// Make karma asynchronous
window.__karma__.loaded = function () {};

// Load all tests specs through curl
(function () {
    var tests = [];
    var specFileExpr = /.*\.spec\.js$/;
    for (var file in window.__karma__.files) {
        if (specFileExpr.test(file)) {
            tests.push(file);
        }
    }

    curl(tests).then(function () {
        window.__karma__.start();
    });
})();
