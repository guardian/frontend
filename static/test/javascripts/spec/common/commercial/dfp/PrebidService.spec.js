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

        beforeEach(function (done) {
            injector.mock(
                'common/modules/commercial/dfp/QueueAsync',
                function () {
                    return mockAsyncQueue;
                }
            );

            injector.require([
                'common/modules/commercial/dfp/PrebidService'
            ], function () {
                prebidService = new arguments[0]();
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
            // jscs:disable requireDotNotation
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
                    expect(
                        getPriceBucket({cpm: 28.61})
                    ).toBe('20.00');
                });

                it('Values under $1 are floored to 5 cent segments', function () {
                    expect(
                        getPriceBucket({cpm: 0.89})
                    ).toBe('0.85');
                });
            });
            // jscs:enable
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
