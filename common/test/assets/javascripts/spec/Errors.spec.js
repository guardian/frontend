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
        
        afterEach(function() {
            common.$g('#js-err').remove();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.onerror).toBeDefined();
        });

        it("should log javascript errors with the error message, line number and file", function(){
            e.log(fakeError.message, fakeError.filename, fakeError.lineno);
            expect(document.getElementById('js-err').getAttribute('src')).toContain('/px.gif?js/message=foo&filename=foo.js&lineno=1&isAd=0');
        });

        it("if DEV, should log to console", function(){
        	var cons = {
	        		error: jasmine.createSpy('error')
	        	},
            	e = new Errors({ isDev: true, window: w, console: cons });
            e.log(fakeError.message, fakeError.filename, fakeError.lineno);
            expect(cons.error.mostRecentCall.args[0]).toEqual({
            	message: fakeError.message, filename: fakeError.filename, lineno: fakeError.lineno, isAd: 0
        	});
        });
        
        describe('Advert errors', function() {
            
            it("it should log 'documentwriteslot.js' errors as advert errors", function(){
                e.log(fakeError.message, 'modules/adverts/documentwriteslot.js', fakeError.lineno);
                expect(document.getElementById('js-err').getAttribute('src')).toContain(
                    '/px.gif?js/message=foo&filename=modules%2Fadverts%2Fdocumentwriteslot.js&lineno=1&isAd=1'
                );
            });
            
            it("it should log 'Script error.' errors as advert errors", function(){
                e.log('Script error.', fakeError.filename, fakeError.lineno);
                expect(document.getElementById('js-err').getAttribute('src')).toContain(
                    '/px.gif?js/message=Script%20error.&filename=foo.js&lineno=1&isAd=1'
                );
            });
            
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
