define([
    'bonzo',
    'jasq'
], function (
    bonzo
) {

    describe('Beacon', {
        moduleName: 'common/modules/analytics/beacon',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            beaconUrl: '//beacon.guim.co.uk'
                        }
                    };
                }
            }
        },
        specify: function () {

            it('should exist', function (beacon) {
                expect(beacon).toBeDefined();
            });

            it('should create correct img element when fired', function (beacon) {
                var img = beacon.fire('/pv.gif');

                expect(img.nodeName.toLowerCase()).toBe('img');
                expect(bonzo(img).attr('src')).toBe('//beacon.guim.co.uk/pv.gif');
            });

            it('should create correct img element when counting', function (beacon) {
                var img = beacon.counts('blocked-ads');

                expect(bonzo(img).attr('src')).toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads');
            });

            it('should create correct img element when counting more than one', function (beacon) {
                var img = beacon.counts(['blocked-ads', 'localStorage-supported']);

                expect(bonzo(img).attr('src'))
                    .toBe('//beacon.guim.co.uk/counts.gif?c=blocked-ads&c=localStorage-supported');
            });

        }
    });

});
