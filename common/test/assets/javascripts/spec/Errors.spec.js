define(['common/common', 'bean', 'common/modules/analytics/errors'], function(common, bean, errors) {

    describe("Errors", function() {

        var w = {
                location: {
                    hash: ''
                }
            },
            fakeError = { 'message': 'foo', lineno: 1, filename: 'foo.js' };

        beforeEach(function() {
            errors.init({
                window: w,
                buildNumber: 643
            });
        });

        afterEach(function() {
            common.$g('#js-err').remove();
        });

        it("should listen for uncaught errors on the window object", function(){
            expect(w.onerror).toBeDefined();
        });

        it("should log javascript errors with the error message, line number, build number, and file", function(){
            expect(errors.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeTruthy();
        });

        it("after logging, should let browser handle error if window hash is set", function(){
            var win = {
                location: {
                    hash: '#showErrors'
                }
            };
            errors.init({window: win, buildNumber: 643});
            expect(errors.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeFalsy();
        });

        it("if DEV, and an uncaught error, should do nothing", function(){
            var cons = {
                error: jasmine.createSpy('error')
            };
            errors.init({ isDev: true, console: cons });
            expect(errors.log(fakeError.message, fakeError.filename, fakeError.lineno, true)).toBeFalsy();
            expect(cons.error).not.toHaveBeenCalled();
        });

        it("if DEV, and a caught error, should log to console", function(){
            var cons = {
                error: jasmine.createSpy('error')
            };

            errors.init({ isDev: true, console: cons, buildNumber: 643 });
            expect(errors.log(fakeError.message, fakeError.filename, fakeError.lineno)).toBeFalsy(false);
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
                expect(errors.log(event.originalEvent, fakeError.filename, fakeError.lineno)).toBeTruthy();
            })
            bean.fire(script, 'error');
        });

    });
})
