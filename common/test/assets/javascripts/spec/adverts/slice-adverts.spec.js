define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'helpers/fixtures',
    'common/modules/adverts/slice-adverts'
], function(
    $,
    bean,
    bonzo,
    qwery,
    fixtures,
    SliceAdverts
){

    describe('Slice Adverts', function() {

        var fixturesConfig = {
                id: 'slice-adverts',
                fixtures: [
                    '<div class="container container-first"><div class="linkslist-container js-slice--ad-candidate"><div class="slice"></div></div></div>',
                    '<div class="container container-second"></div>',
                    '<div class="container container-third"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>',
                    '<div class="container container-fourth"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>',
                    '<div class="container container-fifth"><div class="js-slice--ad-candidate"><div class="slice"></div></div></div>'
                ]
            },
            createSwitch = function(isOn){
                return {
                    switches: {
                        standardAdverts: isOn
                    }
                };
            };

        beforeEach(function() {
            fixtures.render(fixturesConfig);
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
        });

        it('should be able to instantiate', function() {
            expect(new SliceAdverts()).toBeDefined();
        });

        it('should not initiated if standard-adverts switch is off', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(false));
            expect(sliceAdverts.init()).toBeFalsy();
        });

        it('should only create a maximum of 2 advert slots', function() {
            new SliceAdverts(createSwitch(true)).init();
            expect(qwery('.slice--has-ad .ad-slot').length).toEqual(2);
        });

        it('should have the correct ad names', function() {
            new SliceAdverts(createSwitch(true)).init();
            var $adSlots = $('.slice--has-ad .ad-slot').map(function(slot) { return $(slot); });
            expect($adSlots[0].data('name')).toEqual('inline1');
            expect($adSlots[1].data('name')).toEqual('inline2');
        });

        it('should have the correct size mappings', function() {
            new SliceAdverts(createSwitch(true)).init();
            $('.slice--has-ad .ad-slot')
                .map(function(slot) { return $(slot); })
                .forEach(function($adSlot) {
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('tabletportrait')).toEqual('300,250');
                });
        });

        it('should have at least two non-advert containers between advert containers', function() {
            new SliceAdverts(createSwitch(true)).init();
            expect(qwery('.container-first .ad-slot').length).toBe(1);
            expect(qwery('.container-fourth .ad-slot').length).toBe(1);
        });

        it('should not add ad to first container if network front', function() {
            var config = createSwitch(true);
            config.page = {
                pageId: 'uk'
            };
            new SliceAdverts(config).init();
            expect(qwery('.container-first .ad-slot').length).toBe(0);
        });

    });

});
