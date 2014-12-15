define([
    'bonzo',
    'squire',
    'common/modules/analytics/beacon'
], function (
    bonzo,
    Squire,
    beacon
) {

    var config = {
        page: {
            beaconUrl: '//beacon.guim.co.uk'
        }
    };

    new Squire()
        .mock({
            'common/utils/config': config
        })
        .require(['common/modules/analytics/beacon'], function (beacon) {

            describe('Beacon', function () {

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

                    expect(bonzo(img).attr('src')).toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads');
                });

                it('should create correct img element when counting more than one', function () {
                    var img = beacon.counts(['blocked-ads', 'localStorage-supported']);

                    expect(bonzo(img).attr('src'))
                        .toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads&c=localStorage-supported');
                });

            });

        });

});
