define(['common/utils/context'], function(context) {

    describe('Context', function() {
        it ('should return document as default context', function() {
            expect(context()).toBe(document);
        });

        it ('should set context to given value', function() {
            var b = document.querySelector('body');
            context.set(b);
            expect(context()).toBe(b);
        });
    });

}); // define