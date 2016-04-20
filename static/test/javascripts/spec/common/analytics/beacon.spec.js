define([
    'bonzo',
    'helpers/injector'
], function (
    bonzo,
    Injector
) {

    var beacon,
        inject = new Injector(),
        config = {
            page: {
                beaconUrl: '//beacon.guim.co.uk'
            }
        };

    beforeEach(function (done) {
        inject.mock('common/utils/config', config);

        inject.require(['common/modules/analytics/beacon'], function (beaconDependency) {
            beacon = beaconDependency;
            done();
        });
    });

    it('should exist', function () {
        expect(beacon).toBeDefined();
    });

    it('should create correct img element when fired', function () {
        var img = beacon.fire('/pv.gif');

        expect(img.nodeName.toLowerCase()).toBe('img');
        expect(bonzo(img).attr('src')).toBe('//beacon.guim.co.uk/pv.gif');
    });

    it('should create correct img element when counting', function () {
        var img = beacon.counts('blocked-ads');

        if (!navigator.sendBeacon) {
            expect(bonzo(img).attr('src')).toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads');
        }
    });

    it('should create correct img element when counting more than one', function () {
        var img = beacon.counts(['blocked-ads', 'localStorage-supported']);

        if (!navigator.sendBeacon) {
            expect(bonzo(img).attr('src'))
                .toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads&c=localStorage-supported');
        }
    });
});
