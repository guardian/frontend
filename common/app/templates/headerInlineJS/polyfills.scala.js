@()
@import conf.Static
@import conf.Configuration

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

// needed due to class manipulation in bonzo is not x-browser - https://github.com/ded/bonzo/pull/133
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// JSON support needed for raven
if (typeof JSON !== 'object') {
    var s = document.createElement('script'),
    sc = document.getElementsByTagName('script')[0];
    s.src = '@Static("javascripts/components/JSON-js/json2.js")';
    sc.parentNode.insertBefore(s, sc);
}
