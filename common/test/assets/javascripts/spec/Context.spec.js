define(['common/utils/contextualiser', 'common/utils/context'], function(contextualiser, context) {

    describe('Context', function() {
        it ('should return document as default context', function() {
            expect(context).toBe(document);
            contextualiser.set(5);
            console.info(context);
        });
    });

}); // define