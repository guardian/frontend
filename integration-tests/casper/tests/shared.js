system = require('system');
environment = system.env.ENVIRONMENT;
host = {
    dev:    'http://localhost:9000/',
    code:   'http://m.code.dev-theguardian.com/',
    prod:   'http://www.theguardian.com/'
}[environment];

casper.echo('Running tests against ' + environment + ' environment');
casper.echo('Environment host is ' + host);

clearLocalStorage = function() {
    casper.evaluate(function() { window.localStorage.clear(); });
};

casper.on('page.error', function(msg, trace) {
    console.log('Error: '+ msg);
    trace.forEach(function(item) {
        console.log('File:' + item.file + ' line:' + item.line + ' function: ' + item['function']);
    });
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
