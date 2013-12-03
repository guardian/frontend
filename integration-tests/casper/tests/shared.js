system = require('system');
environment = system.env.ENVIRONMENT;
host = {
    marc:   'http://marcjones:9000/',
    dev:    'http://localhost:9000/',
    code:   'http://m.code.dev-theguardian.com/',
    prod:   'http://www.theguardian.com/'
}[environment];

viewports = {
	mobile:  {width: 320, height: 480},
	tablet:  {width: 768, height: 1024},
	desktop: {width: 1024, height: 768},
	wide:    {width: 1366, height: 768}
};

screens = 'integration-tests/target/casper/fail-screenshots/';

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);

clearLocalStorage = function() {
    casper.evaluate(function() { window.localStorage.clear(); });
};

casper.options.waitTimeout = 10000;

casper.on('page.error', function(msg, trace) {
    console.log('-----------------------------');
    console.log('Casper Page Error: ' + msg);
    trace.forEach(function(item) {
        console.log('File:' + item.file + ' line:' + item.line + ' function: ' + item['function']);
    });
    console.log('-----------------------------');
});

casper.on('http.status.404', function(resource) {
    console.log('-----------------------------');
    console.log('Request returned a 404 status, page does not exist');
    console.log('URL: ' + resource.url);
    console.log('-----------------------------');
});

casper.on('http.status.500', function(resource) {
    console.log('-----------------------------');
    console.log('Request returned a 500 status, internal server error');
    console.log('URL: ' + resource.url);
    console.log('-----------------------------');
});

casper.on('http.status.504', function(resource) {
    console.log('-----------------------------');
    console.log('Request returned a 504 status, gateway timeout');
    console.log('URL: ' + resource.url);
    console.log('-----------------------------');
});

casper.on('page.initialized', function() {
    casper.evaluate(function() {
        if (typeof Function.prototype.bind !== "function") {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind#Compatibility
            Function.prototype.bind = function (oThis) {
                "use strict";
                /* jshint -W055 */
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }
                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function() {},
                    fBound = function() {
                      return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                                           aArgs.concat(Array.prototype.slice.call(arguments)));
                    };
                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
    });
});
