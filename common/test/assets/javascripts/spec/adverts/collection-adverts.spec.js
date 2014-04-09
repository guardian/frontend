define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'helpers/fixtures',
    'common/modules/adverts/collection-adverts'
], function(
    $,
    bean,
    bonzo,
    qwery,
    fixtures,
    CollectionAdverts
){

    describe('Collection Adverts', function() {

        var fixturesConfig = {
                id: 'collection-adverts',
                fixtures: [
                    '<div class="collection-wrapper--ad"><div class="collection-one"></div></div>',
                    '<div class="collection-wrapper--ad"><div class="collection-two"></div></div>',
                    '<div class="collection-wrapper--ad"><div class="collection-three"></div></div>'
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
            var collectionAdverts = new CollectionAdverts();
            expect(collectionAdverts).toBeDefined();
        });

        it('should not initiated if standard-adverts switch is off', function() {
            var collectionAdverts = new CollectionAdverts(createSwitch(false));
            expect(collectionAdverts.init()).toBeFalsy();
        });

        it('should only create a maximum of 2 advert slorts', function() {
            var collectionAdverts = new CollectionAdverts(createSwitch(true));
            collectionAdverts.init();
            expect(qwery('.collection-wrapper--ad .ad-slot').length).toEqual(2);
        });

        it('should have the correct ad names', function() {
            var collectionAdverts = new CollectionAdverts(createSwitch(true));
            collectionAdverts.init();
            var $adSlots = $('.collection-wrapper--ad .ad-slot').map(function(slot) { return $(slot); });
            expect($adSlots[0].data('name')).toEqual('inline1');
            expect($adSlots[1].data('name')).toEqual('inline2');
        });

        it('should have the correct size mappings', function() {
            var collectionAdverts = new CollectionAdverts(createSwitch(true));
            collectionAdverts.init();
            $('.collection-wrapper--ad .ad-slot')
                .map(function(slot) { return $(slot); })
                .forEach(function($adSlot) {
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('tabletportrait')).toEqual('300,250');
                });
        });

        it('should move the existing content', function() {
            var collectionAdverts = new CollectionAdverts(createSwitch(true));
            collectionAdverts.init();
            var $collectionItem = $('.collection-wrapper--ad .collection__item').map(function(slot) { return $(slot); });
            expect($collectionItem[0].html()).toEqual('<div class="collection-one"></div>');
            expect($collectionItem[1].html()).toEqual('<div class="collection-two"></div>');
        });

    });

});
