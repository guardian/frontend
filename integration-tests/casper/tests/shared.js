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

casper.on('run.start', function() {
    casper.evaluate(function() {
        if (typeof Function.prototype.bind !== "function") {
            Function.prototype.bind = function (oThis) {
                if (typeof this !== "function") {
                    // closest thing possible to the ECMAScript 5 internal IsCallable function
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }

                var aArgs = Array.prototype.slice.call(arguments, 1),
                    fToBind = this,
                    fNOP = function () {},
                    fBound = function () {
                        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                    };

                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();

                return fBound;
            };
        }
    });
});
