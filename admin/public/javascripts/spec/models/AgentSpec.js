define(['models/agent', 'Knockout']).then(

    function  (Agent, Knockout) {

        describe('Agent Model', function() {

            var agent;

            beforeEach(function() {
                agent = new Agent();
            });

            it('should have an id property', function() {
                expect(agent.id()).toBeDefined();
            });

            it('should hydrate the model on construction', function() {
                var o = { id: "foo", name: "bar", explainer: "car", sameAs: [ "dog", "egg" ] }
                  , agent = new Agent(o);
                expect(agent.id()).toBe("foo");
                expect(agent.name()).toBe("bar");
                expect(agent.explainer()).toBe("car");
                expect(agent.sameAs().length).toEqual(2);
            });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
