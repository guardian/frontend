define([
    'qwery',
    'helpers/fixtures',
    'common/utils/$',
    'common/modules/userPrefs',
    'common/modules/commercial/slice-adverts'
], function(
    qwery,
    fixtures,
    $,
    userPrefs,
    sliceAdverts
) {

    describe('Slice Adverts', function() {

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
            fixture,
            config;

        beforeEach(function() {
            fixtures.render(fixturesConfig);
            fixture = qwery('#' + fixturesConfig.id)[0];
            config = {
                switches: {
                    standardAdverts: true
                }
            };
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
            sliceAdverts.reset();
            userPrefs.remove('container-states');
        });

        it('should exist', function() {
            expect(sliceAdverts).toBeDefined();
        });

        it('should not not display ad slot if standard-adverts switch is off', function() {
            config.switches.standardAdverts = false;
            expect(sliceAdverts.init(config)).toBe(false);
            expect(qwery('.ad-slot', fixture).length).toBe(0);
        });

        it('should only create a maximum of 2 advert slots', function() {
            sliceAdverts.init(config);
            expect(qwery('.slice--has-ad .ad-slot', fixture).length).toEqual(2);
        });

        it('should have the correct ad names', function() {
            sliceAdverts.init(config);
            var $adSlots = $('.slice--has-ad .ad-slot', fixture).map(function(slot) { return $(slot); });
            expect($adSlots[0].data('name')).toEqual('inline1');
            expect($adSlots[1].data('name')).toEqual('inline2');
        });

        it('should have the correct size mappings', function() {
            sliceAdverts.init(config);
            $('.slice--has-ad .ad-slot', fixture)
                .map(function(slot) { return $(slot); })
                .forEach(function($adSlot) {
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('tablet')).toEqual('300,250');
                });
        });

        it('should have at least two non-advert containers between advert containers', function() {
            sliceAdverts.init(config);
            expect(qwery('.container-first .ad-slot', fixture).length).toBe(1);
            expect(qwery('.container-fourth .ad-slot', fixture).length).toBe(1);
        });

        it('should not add ad to first container if network front', function() {
            config.page = {
                pageId: 'uk'
            };
            sliceAdverts.init(config);
            expect(qwery('.container-first .ad-slot', fixture).length).toBe(0);
        });

        it('should not add ad to container if it is closed', function() {
            var containerId = '9cd2-e508-2bc1-5afd',
                prefs = {};
            prefs[containerId] = 'closed';
            $('.container-first', fixture).attr('data-id', containerId);
            userPrefs.set('container-states', prefs);
            sliceAdverts.init(config);
            expect(qwery('.container-third .ad-slot', fixture).length).toBe(1);
            expect(qwery('.container-sixth .ad-slot', fixture).length).toBe(1);
        });

    });

});
