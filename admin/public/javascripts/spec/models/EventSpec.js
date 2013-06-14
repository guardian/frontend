curl(['models/event', 'Knockout']).then(

    function  (Event, Knockout) {

        describe('Event Model', function() {

            var e; 

            beforeEach(function() {
                e = new Event;
            });

            xit('should prettify the start date & time', function() {})
            
            // init 
            xit('should hydrate the model upon construction', function() {})
            
            // articles
            xit('should add an article to the event', function() {})
            xit('should add an article to the event by id', function() {})
            xit('should disallow duplicate articles in an event', function() {})
            xit('should remove an article from an event', function() {})
            
            // decorate
            xit('should decorate each article with properties from the API', function() {}) // title, date etc.
            xit('should only decorate properties where the cached value does not exist', function() {}) // title, date etc.

            // save
            xit('should save the event (via the api)', function() {})
            xit('should prevent saving within short periods of time', function() {})
            
            // bump
            xit('should maintain at most two bumped articles', function() {})
            xit('should have importance of 100 when bumped', function() {})
            xit('should have importance of 50 when unbumped', function() {})

            // set colour
            xit('should toggle the colour between light and dark tone', function() {})
            
            // urlPath 
            xit('should construct a anchor DOM element from a url', function() {})
            
            // slugify
            xit('should sanitise the title ...', function() {})
            
            // toJSON
            xit('should serialise a JSON object', function() {})

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
