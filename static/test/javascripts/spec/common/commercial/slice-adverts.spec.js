define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/modules/userPrefs',
    'helpers/fixtures',
    'text!fixtures/commercial/slice-adverts.html',
    'jasq'
], function (
    bonzo,
    qwery,
    $,
    userPrefs,
    fixtures,
    sliceAdvertsHtml
) {

    describe('Slice Adverts', {
        moduleName: 'common/modules/commercial/slice-adverts',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        switches: {
                            standardAdverts: true
                        },
                        page: {
                            pageId: 'uk/commentisfree'
                        }
                    };
                }
            }
        },
        specify: function () {

            var fixturesConfig = {
                    id: 'slice-adverts',
                    fixtures: [sliceAdvertsHtml]
                },
                $fixtureContainer;

            beforeEach(function () {
                $fixtureContainer = fixtures.render(fixturesConfig);
            });

            afterEach(function () {
                fixtures.clean(fixturesConfig.id);
                userPrefs.remove('container-states');
            });

            it('should exist', function (sliceAdverts) {
                expect(sliceAdverts).toBeDefined();
            });

            it('should only create a maximum of 4 advert slots', function (sliceAdverts) {
                sliceAdverts.init();

                expect(qwery('.ad-slot', $fixtureContainer).length).toEqual(4);
            });

            it('should remove the "facia-slice__item--no-mpu" class', function (sliceAdverts) {
                sliceAdverts.init();

                $('.ad-slot', $fixtureContainer).each(function (adSlot) {
                    expect(bonzo(adSlot).parent().hasClass('facia-slice__item--no-mpu')).toBe(false);
                })
            });

            it('should have the correct ad names', function (sliceAdverts) {
                sliceAdverts.init();
                var $adSlots = $('.ad-slot', $fixtureContainer).map(function (slot) { return $(slot); });

                expect($adSlots[0].data('name')).toEqual('inline1');
                expect($adSlots[1].data('name')).toEqual('inline1');
                expect($adSlots[2].data('name')).toEqual('inline2');
                expect($adSlots[3].data('name')).toEqual('inline2');
            });

            it('should have the correct size mappings', function (sliceAdverts) {
                sliceAdverts.init();
                $('.ad-slot--inline1', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('300,1|300,50|300,250');
                    expect($adSlot.data('mobile-landscape')).toEqual('300,1|300,50|320,50|300,250');
                    expect($adSlot.data('tablet')).toEqual('300,1|300,250');
                });
                $('.ad-slot--inline2', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);

                    expect($adSlot.data('mobile')).toEqual('300,1|300,50');
                    expect($adSlot.data('mobile-landscape')).toEqual('300,1|300,50|320,50');
                    expect($adSlot.data('tablet')).toEqual('300,1|300,250');
                });
            });

            it('should have at least one non-advert containers between advert containers', function (sliceAdverts) {
                sliceAdverts.init();

                expect(qwery('.container-first .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.container-third .ad-slot', $fixtureContainer).length).toBe(1);
            });

            it('should not not display ad slot if standard-adverts switch is off', function (sliceAdverts, deps) {
                deps['common/utils/config'].switches.standardAdverts = false;

                expect(sliceAdverts.init()).toBe(false);
                expect(qwery('.ad-slot', $fixtureContainer).length).toBe(0);
            });

            it('should not add ad to first container if network front', function (sliceAdverts, deps) {
                deps['common/utils/config'].page.pageId = 'uk';
                sliceAdverts.init();

                expect(qwery('.container-first .ad-slot', $fixtureContainer).length).toBe(0);
                expect(qwery('.container-third .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
            });

            it('should not add ad to container if it is closed', function (sliceAdverts) {
                var containerId = '9cd2-e508-2bc1-5afd',
                    prefs       = {};
                prefs[containerId] = 'closed';
                $('.container-first', $fixtureContainer).attr('data-id', containerId);
                userPrefs.set('container-states', prefs);
                sliceAdverts.init();

                expect(qwery('.container-third .ad-slot', $fixtureContainer).length).toBe(1);
                expect(qwery('.container-fifth .ad-slot', $fixtureContainer).length).toBe(1);
            });

            it(
                'should add one slot for tablet, one slot for mobile after container',
                function (sliceAdverts) {
                    sliceAdverts.init();

                    expect($('.container-first .ad-slot', $fixtureContainer).hasClass('hide-on-mobile'))
                        .toBe(true);
                    expect($('.container-first + .ad-slot', $fixtureContainer).hasClass('mobile-only'))
                        .toBe(true);
                }
            );

        }
    });

});
