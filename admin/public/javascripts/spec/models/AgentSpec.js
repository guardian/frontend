define(['models/agent', 'knockout'], function(Agent, knockout) {

    describe('Agent Model', function() {

        var agent;

        beforeEach(function() {
            agent = new Agent({id: 'test'});
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
        });

    });

});
