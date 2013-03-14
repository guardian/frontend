define(['../EventEmitter'], function(EventEmitter) {
    // Set up the Jasmine environment
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    // Configure the tests
    describe('getListeners', function() {
        var ee;

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('initialises the event object and a listener array', function() {
            ee.getListeners('foo');
            expect(ee._events).toEqual({
                foo: []
            });
        });

        it('does not overwrite listener arrays', function() {
            var listeners = ee.getListeners('foo');
            listeners.push('bar');

            expect(ee._events).toEqual({
                foo: ['bar']
            });

            ee.getListeners('foo');

            expect(ee._events).toEqual({
                foo: ['bar']
            });
        });
    });

    describe('addListener', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){};

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('adds a listener to the specified event', function() {
            ee.addListener('foo', fn1);
            expect(ee.getListeners('foo')).toEqual([fn1]);
        });

        it('does not allow duplicate listeners', function() {
            ee.addListener('bar', fn1);
            expect(ee.getListeners('bar')).toEqual([fn1]);

            ee.addListener('bar', fn2);
            expect(ee.getListeners('bar')).toEqual([fn1, fn2]);

            ee.addListener('bar', fn1);
            expect(ee.getListeners('bar')).toEqual([fn1, fn2]);
        });
    });

    describe('removeListener', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){},
            fn3 = function(){},
            fn4 = function(){},
            fnX = function(){};

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('does nothing when the listener is not found', function() {
            var orig = ee.getListeners('foo').length;
            ee.removeListener('foo', fn1);
            expect(ee.getListeners('foo').length).toEqual(orig);
        });

        it('can handle removing events that have not been added', function() {
            expect(ee._events).toBeUndefined();
            ee.removeEvent('foo');
            expect(ee._events).not.toBeUndefined();
        });

        it('actually removes events', function() {
            ee.removeEvent('foo');
            expect(ee._events.foo).toBeUndefined();
        });

        it('removes listeners', function() {
            var listeners = ee.getListeners('bar');

            ee.addListener('bar', fn1);
            ee.addListener('bar', fn2);
            ee.addListener('bar', fn3);
            ee.addListener('bar', fn3); // Make sure doubling up does nothing
            ee.addListener('bar', fn4);
            expect(listeners).toEqual([fn1, fn2, fn3, fn4]);

            ee.removeListener('bar', fn3);
            expect(listeners).toEqual([fn1, fn2, fn4]);

            ee.removeListener('bar', fnX);
            expect(listeners).toEqual([fn1, fn2, fn4]);

            ee.removeListener('bar', fn1);
            expect(listeners).toEqual([fn2, fn4]);

            ee.removeListener('bar', fn4);
            expect(listeners).toEqual([fn2]);

            ee.removeListener('bar', fn2);
            expect(ee._events.bar).toEqual(null);
        });
    });

    describe('removeEvent', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){},
            fn3 = function(){},
            fn4 = function(){},
            fn5 = function(){};

        beforeEach(function() {
            ee = new EventEmitter();

            ee.addListener('foo', fn1);
            ee.addListener('foo', fn2);
            ee.addListener('bar', fn3);
            ee.addListener('bar', fn4);
            ee.addListener('baz', fn5);
            expect(ee.getListeners('foo')).toEqual([fn1, fn2]);
            expect(ee.getListeners('bar')).toEqual([fn3, fn4]);
            expect(ee.getListeners('baz')).toEqual([fn5]);
        });

        it('removes all listeners for the specified event', function() {
            ee.removeEvent('bar');
            expect(ee.getListeners('foo')).toEqual([fn1, fn2]);
            expect(ee.getListeners('bar')).toEqual([]);
            expect(ee.getListeners('baz')).toEqual([fn5]);

            ee.removeEvent('baz');
            expect(ee.getListeners('foo')).toEqual([fn1, fn2]);
            expect(ee.getListeners('bar')).toEqual([]);
            expect(ee.getListeners('baz')).toEqual([]);
        });

        it('removes all events when no event is specified', function() {
            ee.removeEvent();
            expect(ee.getListeners('foo')).toEqual([]);
            expect(ee.getListeners('bar')).toEqual([]);
            expect(ee.getListeners('baz')).toEqual([]);
        });
    });

    describe('emitEvent', function() {
        var ee;

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('executes attached listeners', function() {
            var run = false;

            ee.addListener('foo', function() {
                run = true;
            });
            ee.emitEvent('foo');

            expect(run).toEqual(true);
        });

        it('executes attached with a single argument', function() {
            var key = null;

            ee.addListener('bar', function(a) {
                key = a;
            });
            ee.emitEvent('bar', [50]);

            expect(key).toEqual(50);

            ee.emit('bar', 60);
            expect(key).toEqual(60);
        });

        it('executes attached with arguments', function() {
            var key = null;

            ee.addListener('bar2', function(a, b) {
                key = a + b;
            });
            ee.emitEvent('bar2', [40, 2]);

            expect(key).toEqual(42);
        });

        it('executes multiple listeners', function() {
            var count = 0;

            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });

            ee.emitEvent('baz');

            expect(count).toEqual(5);
        });

        it('executes multiple listeners after one has been removed', function() {
            var count = 0,
                toRemove = function() { count++; };

            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', toRemove);
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });

            ee.removeListener('baz', toRemove);

            ee.emitEvent('baz');

            expect(count).toEqual(4);
        });

        it('executes multiple listeners and removes those that return true', function() {
            var count = 0;

            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; return true; });
            ee.addListener('baz', function() { count++; return false; });
            ee.addListener('baz', function() { count++; return 1; });
            ee.addListener('baz', function() { count++; return true; });

            ee.emitEvent('baz');
            ee.emitEvent('baz');

            expect(count).toEqual(8);
        });
    });

    describe('manipulateListeners', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){},
            fn3 = function(){},
            fn4 = function(){},
            fn5 = function(){};

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('manipulates multiple with an array', function() {
            ee.manipulateListeners(false, 'foo', [fn1, fn2, fn3, fn4, fn5]);
            expect(ee.getListeners('foo')).toEqual([fn5, fn4, fn3, fn2, fn1]);

            ee.manipulateListeners(true, 'foo', [fn1, fn2]);
            expect(ee.getListeners('foo')).toEqual([fn5, fn4, fn3]);

            ee.manipulateListeners(true, 'foo', [fn3, fn5]);
            ee.manipulateListeners(false, 'foo', [fn4, fn1]);
            expect(ee.getListeners('foo')).toEqual([fn4, fn1]);

            ee.manipulateListeners(true, 'foo', [fn4, fn1]);
            expect(ee.getListeners('foo')).toEqual([]);
        });

        it('manipulates with an object', function() {
            ee.manipulateListeners(false, {
                foo: [fn1, fn2, fn3],
                bar: fn4
            });

            ee.manipulateListeners(false, {
                bar: [fn5, fn1]
            });

            expect(ee.getListeners('foo')).toEqual([fn3, fn2, fn1]);
            expect(ee.getListeners('bar')).toEqual([fn4, fn1, fn5]);

            ee.manipulateListeners(true, {
                foo: fn1,
                bar: [fn5, fn4]
            });

            expect(ee.getListeners('foo')).toEqual([fn3, fn2]);
            expect(ee.getListeners('bar')).toEqual([fn1]);

            ee.manipulateListeners(true, {
                foo: [fn3, fn2],
                bar: fn1
            });

            expect(ee.getListeners('foo')).toEqual([]);
            expect(ee.getListeners('bar')).toEqual([]);
        });

        it('does not execute listeners just after they are added in another listeners', function() {
            var count = 0;

            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() {
                count++;

                ee.addListener('baz', function() {
                    count++;
                });
            });
            ee.addListener('baz', function() { count++; });
            ee.addListener('baz', function() { count++; });

            ee.emitEvent('baz');

            expect(count).toEqual(5);
        });
    });

    describe('addListeners', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){},
            fn3 = function(){},
            fn4 = function(){},
            fn5 = function(){};

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('adds with an array', function() {
            ee.addListeners('foo', [fn1, fn2, fn3]);
            expect(ee.getListeners('foo')).toEqual([fn3, fn2, fn1]);

            ee.addListeners('foo', [fn4, fn5]);
            expect(ee.getListeners('foo')).toEqual([fn3, fn2, fn1, fn5, fn4]);
        });

        it('adds with an object', function() {
            ee.addListeners({
                foo: fn1,
                bar: [fn2, fn3]
            });
            expect(ee.getListeners('foo')).toEqual([fn1]);
            expect(ee.getListeners('bar')).toEqual([fn3, fn2]);

            ee.addListeners({
                foo: [fn4],
                bar: fn5
            });
            expect(ee.getListeners('foo')).toEqual([fn1, fn4]);
            expect(ee.getListeners('bar')).toEqual([fn3, fn2, fn5]);
        });
    });

    describe('removeListeners', function() {
        var ee,
            fn1 = function(){},
            fn2 = function(){},
            fn3 = function(){},
            fn4 = function(){},
            fn5 = function(){};

        beforeEach(function() {
            ee = new EventEmitter();
        });

        it('removes with an array', function() {
            ee.addListeners('foo', [fn1, fn2, fn3, fn4, fn5]);
            ee.removeListeners('foo', [fn2, fn3]);
            expect(ee.getListeners('foo')).toEqual([fn5, fn4, fn1]);

            ee.removeListeners('foo', [fn5, fn4]);
            expect(ee.getListeners('foo')).toEqual([fn1]);

            ee.removeListeners('foo', [fn1]);
            expect(ee.getListeners('foo')).toEqual([]);
        });

        it('removes with an object', function() {
            ee.addListeners({
                foo: [fn1, fn2, fn3, fn4, fn5],
                bar: [fn1, fn2, fn3, fn4, fn5]
            });

            ee.removeListeners({
                foo: fn2,
                bar: [fn3, fn4, fn5]
            });
            expect(ee.getListeners('foo')).toEqual([fn5, fn4, fn3, fn1]);
            expect(ee.getListeners('bar')).toEqual([fn2, fn1]);

            ee.removeListeners({
                foo: [fn3],
                bar: [fn2, fn1]
            });
            expect(ee.getListeners('foo')).toEqual([fn5, fn4, fn1]);
            expect(ee.getListeners('bar')).toEqual([]);
        });
    });

    // Run Jasmine
    jasmineEnv.execute();
});