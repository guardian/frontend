curl(['models/events', 'Knockout']).then(

    function  (Events, Knockout) {

        describe('Events Model', function() {

            var e; 

            beforeEach(function() {
                e = new Events;
            });

            it('should have an id property', function() {
                expect(e).toBeDefined();
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
