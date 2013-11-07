define(['common', 'bean', 'modules/errors'], function(common, bean, Errors) {

    describe("Errors", function() {
       
        var e,
            p = '/uk/2012/oct/15/mod-military-arms-firms',
            w = {},
            fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' };
        
        beforeEach(function() {
            e = new Errors({window: w, beaconUrl: 'beacon.gu.com', buildNumber: 643});
            e.init();
        });
        
        afterEach(function() {
            common.$g('#js-err').remove();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.onerror).toBeDefined();
        });

        it("should log javascript errors with the error message, line number, build number, and file", function(){
            expect(e.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeTruthy();
            expect(document.getElementById('js-err').getAttribute('src')).toContain('beacon.gu.com/px.gif?message=foo&filename=foo.js&lineno=1&type=js&build=643');
        });

        it("after logging, should let browser handle error if user pref switch 'showErrors is on", function(){
            var userPrefs = {
                    isOn: jasmine.createSpy('isOn').andReturn(true)
                },
                e = new Errors({ userPrefs: userPrefs });
            expect(e.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeFalsy();
        });

        it("if DEV, and an uncaught error, should do nothing", function(){
            var cons = {
                    error: jasmine.createSpy('error')
                },
                e = new Errors({ isDev: true, console: cons });
            expect(e.log(fakeError.message, fakeError.filename, fakeError.lineno, true)).toBeFalsy();
            expect(cons.error).not.toHaveBeenCalled();
        });

        it("if DEV, and a caught error, should log to console", function(){
            var cons = {
                    error: jasmine.createSpy('error')
                },
                e = new Errors({ isDev: true, console: cons });
            expect(e.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeFalsy(false);
            expect(cons.error.mostRecentCall.args[0]).toEqual({
                message: fakeError.message, filename: fakeError.filename, lineno: fakeError.lineno
            });
        });
        
        describe('Advert errors', function() {
            
            it("it should log 'documentwriteslot.js' errors as advert errors", function(){
                e.log(fakeError.message, 'modules/adverts/documentwriteslot.js', fakeError.lineno);
                expect(document.getElementById('js-err').getAttribute('src')).toContain(
                    'beacon.gu.com/px.gif?message=foo&filename=modules%2Fadverts%2Fdocumentwriteslot.js&lineno=1&type=ads'
                );
            });
            
            it("it should log 'Script error.' errors as advert errors", function(){
                e.log('Script error.', fakeError.filename, fakeError.lineno);
                expect(document.getElementById('js-err').getAttribute('src')).toContain(
                    'beacon.gu.com/px.gif?message=Script%20error.&filename=foo.js&lineno=1&type=ads'
                );
            });
            
        });

        it("should correctly parse [object Event] errors", function(){
            // script element for error event
            var script = document.createElement('script');
            script.src = 'http://foo.com/bar.js';
            // fake event
            bean.on(script, 'error', function(event) {
                e.log(event.originalEvent, fakeError.filename, fakeError.lineno);
                expect(document.getElementById('js-err').getAttribute('src')).toContain('Syntax%20or%20http%20error%3A%20http%3A%2F%2Ffoo.com%2Fbar.js');
            })
            bean.fire(script, 'error');
        });

    });
})
