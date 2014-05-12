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
                    '<div class="container"><div class="linkslist-container facia-slice-wrapper--ad"><div class="slice-one"></div></div></div>',
                    '<div class="container"></div>',
                    '<div class="container"><div class="facia-slice-wrapper--ad"><div class="slice-two"></div></div></div>',
                    '<div class="container"><div class="facia-slice-wrapper--ad"><div class="slice-three"></div></div></div>',
                    '<div class="container"><div class="facia-slice-wrapper--ad"><div class="slice-one"></div></div></div>'
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
            var sliceAdverts = new SliceAdverts();
            expect(sliceAdverts).toBeDefined();
        });

        it('should not initiated if standard-adverts switch is off', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(false));
            expect(sliceAdverts.init()).toBeFalsy();
        });

        it('should only create a maximum of 2 advert slorts', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            expect(qwery('.facia-slice-wrapper--ad .ad-slot').length).toEqual(2);
        });

        it('should have the correct ad names', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            var $adSlots = $('.facia-slice-wrapper--ad .ad-slot').map(function(slot) { return $(slot); });
            expect($adSlots[0].data('name')).toEqual('inline1');
            expect($adSlots[1].data('name')).toEqual('inline2');
        });

        it('should have the correct size mappings', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            $('.facia-slice-wrapper--ad .ad-slot')
                .map(function(slot) { return $(slot); })
                .forEach(function($adSlot) {
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('tabletportrait')).toEqual('300,250');
                });
        });

        it('should move the existing content', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            var $sliceItem = $('.facia-slice-wrapper--ad .facia-slice__item').map(function(slot) { return $(slot); });
            expect($sliceItem[0].html()).toEqual('<div class="slice-one"></div>');
            expect($sliceItem[1].html()).toEqual('<div class="slice-two"></div>');
        });

        it('should not ad slot to hidden container', function() {
            $('.container')
                .first()
                .css('display', 'none');
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            var $sliceItem = $('.facia-slice-wrapper--ad .facia-slice__item').map(function(slot) { return $(slot); });
            expect($sliceItem[0].html()).toEqual('<div class="slice-two"></div>');
            expect($sliceItem[1].html()).toEqual('<div class="slice-three"></div>');
        });

        it('should change collection classes', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init().forEach(function($adSlice) {
                expect($adSlice.hasClass('linkslist-container')).toEqual(false);
                expect($adSlice.hasClass('facia-slice-wrapper facia-slice-wrapper--position-2')).toEqual(true);
            });
        });

    });

});
