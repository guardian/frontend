define(['common', 'modules/errors'], function(common, Errors) {

    describe("Errors", function() {
       
        var e,
            p = 'uk/2012/oct/15/mod-military-arms-firms',
            w = {
                addEventListener: jasmine.createSpy('error'),
                location: { 
                    href: 'http://'
                },
                navigator: { 
                    userAgent:  "Mozilla/5.0 (iPad; ..."
                },
            };
        
        beforeEach(function() {
            e = new Errors(w);
            e.init();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.addEventListener.mostRecentCall.args[0]).toBe('error');
        });

        it("should log javascript errors with the error message, line number and file", function(){
            var fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' }
            e.log(fakeError);
            expect(document.getElementById('js-err').getAttribute('src')).toBe('//gu-pix.appspot.com/px/frontend/e/1?tag=foo%2C1%2Cfoo.js%2Chttp%3A%2F%2F%2CMozilla%2F5.0%20(iPad%3B%20...');
        });

    });
})
