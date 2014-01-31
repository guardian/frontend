define(['common/common', 'bean', 'common/modules/analytics/errors'], function(common, bean, Errors) {

    describe("Errors", function() {
       
        var e,
            p = '/uk/2012/oct/15/mod-military-arms-firms',
            w = {},
            fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' };
        
        beforeEach(function() {
            e = new Errors({window: w, buildNumber: 643});
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
                e = new Errors({ isDev: true, console: cons, buildNumber: 643 });
            expect(e.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeFalsy(false);
            expect(cons.error.mostRecentCall.args[0]).toEqual({
                message: fakeError.message, filename: fakeError.filename, lineno: fakeError.lineno,
                build: 643, type: 'js'
            });
        });

        it("should correctly parse [object Event] errors", function(){
            // script element for error event
            var script = document.createElement('script');
            script.src = 'http://foo.com/bar.js';
            // fake event
            bean.on(script, 'error', function(event) {
                expect(e.log(event.originalEvent, fakeError.filename, fakeError.lineno)).toBeTruthy();
            })
            bean.fire(script, 'error');
        });

    });
})
