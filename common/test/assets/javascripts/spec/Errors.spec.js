define(['common', 'modules/errors'], function(common, Errors) {

    describe("Errors", function() {
       
        var e,
            p = 'uk/2012/oct/15/mod-military-arms-firms',
            w = {
                onerror: jasmine.createSpy('error')
            };
        
        beforeEach(function() {
            e = new Errors(w);
            e.init();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.onerror).toBeDefined();
        });

        it("should log javascript errors with the error message, line number and file", function(){
            var fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' }
            e.log(fakeError.message, fakeError.lineno, fakeError.filename);
            expect(document.getElementById('js-err').getAttribute('src')).toContain('/px.gif?js/foo%2C1%2Cfoo.js');
        });

    });
})
