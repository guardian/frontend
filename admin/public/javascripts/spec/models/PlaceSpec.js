define(['models/place', 'knockout'], function(Place, knockout) {

    describe('Place Model', function() {

        var place;

        beforeEach(function() {
            place = new Place;
        });

        it('should have an id property', function() {
            expect(place.id()).toBeDefined();
        });

        it('should hydrate the model on construction', function() {
            var o = { id: "foo", sameAs: [ "dog", "egg" ] }
              , place = new Place(o);
            expect(place.id()).toBe("foo");
        });

    });
});
