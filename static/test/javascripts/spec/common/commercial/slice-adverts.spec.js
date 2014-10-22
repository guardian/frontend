define([
    'bonzo',
    'qwery',
    'common/utils/$',
    'common/modules/userPrefs',
    'helpers/fixtures',
    'jasq'
], function (
    bonzo,
    qwery,
    $,
    userPrefs,
    fixtures
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
                    fixtures: [
                        '<div class="container container-first"><div class="linkslist-container js-slice--ad-candidate"><div class="slice"></div></div></div>',
                        '<div class="container container-second"></div>',
                        '<div class="container container-third"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>',
                        '<div class="container container-fourth"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>',
                        '<div class="container container-fifth"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>',
                        '<div class="container container-sixth"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>'
                    ]
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

            it('should only create a maximum of 2 advert slots', function (sliceAdverts) {
                sliceAdverts.init();
                expect(qwery('.slice--has-ad .ad-slot', $fixtureContainer).length).toEqual(2);
            });

            it('should have the correct ad names', function (sliceAdverts) {
                sliceAdverts.init();
                var $adSlots = $('.slice--has-ad .ad-slot', $fixtureContainer).map(function (slot) { return $(slot); });
                expect($adSlots[0].data('name')).toEqual('inline1');
                expect($adSlots[1].data('name')).toEqual('inline2');
            });

            it('should have the correct size mappings', function (sliceAdverts) {
                sliceAdverts.init();
                $('.slice--has-ad .ad-slot--inline1', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);
                    expect($adSlot.data('mobile')).toEqual('300,50|300,250');
                    expect($adSlot.data('mobile-landscape')).toEqual('300,50|320,50|300,250');
                    expect($adSlot.data('tablet')).toEqual('300,250');
                    expect($adSlot.data('desktop')).toEqual('300,1|300,250');
                });
                $('.slice--has-ad .ad-slot--inline2', $fixtureContainer).each(function (adSlot) {
                    var $adSlot = bonzo(adSlot);
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('mobile-landscape')).toEqual('300,50|320,50');
                    expect($adSlot.data('tablet')).toEqual('300,250');
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

        }
    });

});
