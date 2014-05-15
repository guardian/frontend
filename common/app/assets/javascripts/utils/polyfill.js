define(function() {

    /**
     * ARE YOU SURE YOU WANT TO ADD SOMETHING TO THIS FILE?!
     * You must have an extremely good reason to add a polyfill,
     * we prefer progressive enhancement over graceful degradation
     *
     * This is not to stop you adding polyfills, it is here to make you think before doing so.
     */

    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                Noop = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof Noop && oThis
                            ? this
                            : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            Noop.prototype = this.prototype;
            fBound.prototype = new Noop();

            return fBound;
        };
    }

    return true;
});