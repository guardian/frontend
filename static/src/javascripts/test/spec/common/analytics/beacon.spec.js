define([
    'bonzo',
    'helpers/injector'
], function (
    bonzo,
    Injector
) {

    var config = {
        page: {
            beaconUrl: '//beacon.guim.co.uk'
        }
    };

    //1. the test spec depends on injector, so the normalise method is overriden.
    //2. the injector class is constructed, and contains a list of remappings,
    //     eg. 'common/utils/config' -> 'injector/common/utils/config'
    //3. the injector class registers 'injector/common/utils/config' with System.

    var inject = new Injector();
    
    inject.mock(
        'common/utils/config', config
    );

    return inject.test('common/modules/analytics/beacon', function (beacon) {

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
