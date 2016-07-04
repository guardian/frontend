/* global pbjs */
define('js!prebid.js', [], function () {
    return function () {};
});

define([
    'helpers/injector'
], function (
    Injector
) {
    var injector = new Injector();
    var prebidService;
    var mockLibrary;

    describe('PrebidService', function () {
        var mockAsyncQueue = {
            add : jasmine.createSpy('QueueAsync.add')
        };

        var mockPageTargeting = {
            k : 'technology, laptops'
        };

        beforeEach(function (done) {
            injector.mock(
                'common/utils/QueueAsync',
                function () {
                    return mockAsyncQueue;
                }
            );

            injector.require([
                'common/modules/commercial/dfp/private/PrebidService'
            ], function () {
                prebidService = new arguments[0](mockPageTargeting);
                done();
            });
        });

        it('Exists', function () {
            expect(prebidService).toBeDefined();
        });

        it('Passes requests through QueueAsync', function () {
            // This ensures that only one auction runs at a time,
            // and that an error in any auction is contained
            prebidService.loadAdvert(new MockAdvert());
            expect(mockAsyncQueue.add).toHaveBeenCalled();
        });

        describe('Targeting', function () {
            var targeting;

            beforeEach(function () {
                mockLibrary = loadMockLibrary();
                targeting = mockLibrary.getTargeting();
            });

            it('Is set when the module is initialized', function () {
                expect(targeting['hb_pb']).toBeDefined();
                expect(targeting['hb_adid']).toBeDefined();
            });

            it('Passes the bidResponse adId to DFP', function () {
                var hbAdId = targeting['hb_adid'];
                var dfpValue = hbAdId({
                    adId : 'foo'
                });
                expect(dfpValue).toBe('foo');
            });

            describe('Price bucketing', function () {
                var getPriceBucket;
                beforeEach(function () {
                    getPriceBucket = targeting['hb_pb'];
                });

                it('Caps price values at $20', function () {
                    expect(getPriceBucket({cpm: 28.61})).toBe('20.00');
                });

                it('Floors values from $10 to $19.99 to the nearest $1', function () {
                    expect(getPriceBucket({cpm: 10.00})).toBe('10.00');
                    expect(getPriceBucket({cpm: 10.99})).toBe('10.00');
                    expect(getPriceBucket({cpm: 11.00})).toBe('11.00');
                    expect(getPriceBucket({cpm: 19.99})).toBe('19.00');
                });

                it('Floors values from $5 to $9.99 to the nearest 50c', function () {
                    expect(getPriceBucket({cpm: 5.00})).toBe('5.00');
                    expect(getPriceBucket({cpm: 5.49})).toBe('5.00');
                    expect(getPriceBucket({cpm: 5.50})).toBe('5.50');
                    expect(getPriceBucket({cpm: 9.99})).toBe('9.50');
                });

                it('Floors values from $1 to $4.99 to the nearest 10c', function () {
                    expect(getPriceBucket({cpm: 1.00})).toBe('1.00');
                    expect(getPriceBucket({cpm: 1.09})).toBe('1.00');
                    expect(getPriceBucket({cpm: 1.10})).toBe('1.10');
                    expect(getPriceBucket({cpm: 4.99})).toBe('4.90');
                });

                it('Floors values under $1 to the nearest 5c', function () {
                    expect(getPriceBucket({cpm: 0.00})).toBe('0.00');
                    expect(getPriceBucket({cpm: 0.04})).toBe('0.00');
                    expect(getPriceBucket({cpm: 0.05})).toBe('0.05');
                    expect(getPriceBucket({cpm: 0.99})).toBe('0.95');
                });
            });
        });
    });

    function loadMockLibrary() {
        // Take operations queued for PBJS
        var que = window.pbjs ? window.pbjs.que : [];

        // Replace stub object with implementation
        window.pbjs = new MockAPI();

        // Run through queue
        que.forEach(function (fn) {
            fn.call();
        });

        return new TestAPI();

        // Mock vendor library interface
        function MockAPI() {
            this.que = [];
        }

        // Helpers for unit test
        function TestAPI() {
            this.getTargeting = function () {
                var targeting = pbjs.bidderSettings.standard.adserverTargeting;
                return targeting.reduce(function (result, item) {
                    result[item.key] = item.val;
                    return result;
                }, {});
            };
        }
    }

    function MockAdvert() {
        this.isRendered = false;
        this.isLoading = false;
        this.adSlotId = 'foo';
        this.sizes = [[640, 480]];
        this.slot = {};
    }

});
