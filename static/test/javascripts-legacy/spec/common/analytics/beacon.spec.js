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
                beaconUrl: '//beacon.gu-web.net'
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
        expect(bonzo(img).attr('src')).toBe('//beacon.gu-web.net/pv.gif');
    });

});
