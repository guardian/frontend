define(['common', 'modules/errors'], function(common, Errors) {

    describe("Errors", function() {
       
        var e,
            p = 'uk/2012/oct/15/mod-military-arms-firms',
            w = {},
            fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' };
        
        beforeEach(function() {
            e = new Errors({window: w});
            e.init();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.onerror).toBeDefined();
        });

        it("should log javascript errors with the error message, line number and file", function(){
            e.log(fakeError.message, fakeError.filename, fakeError.lineno);
            expect(document.getElementById('js-err').getAttribute('src')).toBe('/px.gif?js/foo%2Cfoo.js%2C1');
        });

        it("if DEV, should log to console", function(){
        	var cons = {
	        		error: jasmine.createSpy('error')
	        	},
            	e = new Errors({ isDev: true, window: w, console: cons });
            e.log(fakeError.message, fakeError.filename, fakeError.lineno);
            expect(cons.error.mostRecentCall.args[0]).toEqual({
            	message: fakeError.message, filename: fakeError.filename, lineno: fakeError.lineno
        	});
        });

    });
})
