define(['common/utils/context'], function(context) {

    describe('Context', function() {
        it ('should return document.body as default context', function() {
            expect(context()).toBe(document.body);
        });

        it ('should set context to given value', function() {
            var b = document.querySelector('head');
            context.set(b);
            expect(context()).toBe(b);
        });
    });

}); // define