define([
    'Promise',
    'helpers/fixtures',
    'helpers/injector'
], function (Promise, fixtures, Injector) {
    describe('Performance Logging', function () {
        var injector = new Injector();
        var pubads = {
            addEventListener: jasmine.createSpy('addEventListener')
        };
        var googletag = {
            pubads: function () { return pubads; }
        };
        var performanceLogging;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/dfp/performance-logging'
            ], function ($1) {
                performanceLogging = $1;
                done();
            });
        });

        describe('wrap', function () {
            it('should return the wrapped function return value', function () {
                var randomVal = Math.random();
                var fn = performanceLogging.wrap('func', function () {
                    return randomVal;
                });
                expect(fn()).toEqual(randomVal);
            });

            it('should resolve to the wrapped function return value', function (done) {
                var randomVal = Math.random();
                var fn = performanceLogging.wrap('func', function () {
                    return Promise.resolve(randomVal);
                });
                fn().then(function (value) {
                    expect(value).toEqual(randomVal);
                })
                .then(done)
                .catch(done.fail);
            });

            it('should not swallow exception', function () {
                var fn = performanceLogging.wrap('func', function () {
                    throw 'hello';
                });
                try {
                    fn();
                } catch (e) {
                    expect(e).toEqual('hello');
                }
            });

            it('should not swallow promise rejection', function (done) {
                var fn = performanceLogging.wrap('func', function () {
                    return Promise.reject('hello');
                });
                fn().catch(function (value) {
                    expect(value).toEqual('hello');
                })
                .then(done)
                .catch(done.fail);
            });
        });


        describe('defer', function () {
            it('should pass two timing functions', function () {
                var fn = performanceLogging.defer('func', function (fn1, fn2) {
                    expect(fn1).toEqual(jasmine.any(Function));
                    expect(fn2).toEqual(jasmine.any(Function));
                });
                fn();
            });

            it('should return the wrapped function return value', function () {
                var randomVal = Math.random();
                var fn = performanceLogging.defer('func', function () {
                    return randomVal;
                });
                expect(fn()).toEqual(randomVal);
            });

            it('should resolve to the wrapped function return value', function (done) {
                var randomVal = Math.random();
                var fn = performanceLogging.defer('func', function () {
                    return Promise.resolve(randomVal);
                });
                fn().then(function (value) {
                    expect(value).toEqual(randomVal);
                })
                .then(done)
                .catch(done.fail);
            });

            it('should not swallow exception', function () {
                var fn = performanceLogging.defer('func', function () {
                    throw 'hello';
                });
                try {
                    fn();
                } catch (e) {
                    expect(e).toEqual('hello');
                }
            });

            it('should not swallow promise rejection', function (done) {
                var fn = performanceLogging.defer('func', function () {
                    return Promise.reject('hello');
                });
                fn().catch(function (value) {
                    expect(value).toEqual('hello');
                })
                .then(done)
                .catch(done.fail);
            });
        });
    });
});
