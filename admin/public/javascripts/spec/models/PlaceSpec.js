define(['models/place', 'Knockout']).then(

    function  (Place, Knockout) {

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
                expect(place.sameAs().length).toEqual(2);
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
