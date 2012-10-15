define(['common', 'modules/errors'], function(common, Errors) {

    describe("Errors", function() {
       
        var e,
            p = 'uk/2012/oct/15/mod-military-arms-firms',
            n = { 
                userAgent:  "Mozilla/5.0 (iPad; ..."
            },
            w = {
                addEventListener: jasmine.createSpy('error')
            };
        
        beforeEach(function() {
            e = new Errors(p, w, n);
            e.init();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.addEventListener.mostRecentCall.args[0]).toBe('error');
        });

        it("should log javascript errors with the error message, line number and file", function(){
            var fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' }
            e.log(fakeError);
            expect(document.getElementById('cs-err').getAttribute('src')).toBe('//gu-pix.appspot.com/px/frontend/e/1?tag=Zm9vLDEsZm9vLmpzLE1vemlsbGEvNS4wIChpUGFkOyAuLi4=');
        });

        xit("should log messages from module errors", function(){
        });

    });
})


// http://gu-pix.appspot.com/json/count.json?path=/fb/p/3b5am&tag=20121014
// http://gu-pix.appspot.com/px/fb/p/3b5am?tag=20121014
// http://gu-pix.appspot.com/json/count.json?path=/frontend/e/1


