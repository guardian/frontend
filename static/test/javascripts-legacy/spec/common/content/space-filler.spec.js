define([
    'helpers/injector'
], function (
    Injector
) {
    var injector = new Injector();

    describe('Space filler', function () {
        var spaceFiller,
            spaceFinder,
            raven,
            rules = {},
            spacefinderResult,
            writeError = new Error('Mock writer exception');

        beforeEach(function (done) {

            injector.require([
                'common/modules/article/space-filler',
                'common/modules/article/spacefinder',
                'lib/raven'
            ], function () {
                spaceFiller = arguments[0];
                spaceFinder = arguments[1];
                raven = arguments[2];

                spyOn(raven, 'captureException');

                spyOn(spaceFinder, 'findSpace').and.callFake(function () {
                    return spacefinderResult;
                });

                done();
            });
        });

        it('Returns a promise that resolves when the insertion completes', function (done) {
            spacefinderResult = Promise.resolve(null);
            var insertion = spaceFiller.fillSpace(rules, function writer() {});
            expect(insertion).toEqual(jasmine.any(Promise));
            insertion.then(done);
        });

        it('Passes a ruleset to the spacefinder', function (done) {
            var insertion = spaceFiller.fillSpace(rules, function writer() {});
            insertion.then(function () {
                var spaceFinderArgs = spaceFinder.findSpace.calls.mostRecent().args;
                expect(spaceFinderArgs[0]).toBe(rules);
                done();
            });
        });

        it('If it finds a space, it calls the writer', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            spaceFiller.fillSpace(rules, done);
        });

        it('If there are no spaces, it rejects the promise and does not call the writer', function (done) {
            spacefinderResult = Promise.reject(new spaceFinder.SpaceError({}));

            var mockWriter = jasmine.createSpy('mockWriter');
            var insertion = spaceFiller.fillSpace(rules, mockWriter);

            insertion.then(function (result) {
                expect(result).toBe(false);
                expect(mockWriter).not.toHaveBeenCalled();
                done();
            });
        });

        it('If there are no spaces, the spacefinder exception is not recorded by Raven', function (done) {
            // These exceptions are 'expected' and therefore shouldn't go into logging
            spacefinderResult = Promise.reject(new spaceFinder.SpaceError({}));
            var insertion = spaceFiller.fillSpace(rules, function writer() {});

            insertion.then(function () {
                expect(raven.captureException).not.toHaveBeenCalled();
                done();
            });
        });

        it('Calls writers in order', function (done) {
            // This resolves a longstanding race condition where spacefinder calls would come
            // before the scripts that inject content into spaces had completely ran
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var firstWriter = jasmine.createSpy('first write');

            spaceFiller.fillSpace(rules, firstWriter);
            spaceFiller.fillSpace(rules, function secondWriter() {
                expect(firstWriter).toHaveBeenCalled();
                done();
            });
        });

        it('If a writer throws an exception, we record it', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var insertion = spaceFiller.fillSpace(rules, function () {
                throw writeError;
            });

            insertion.then(function () {
                expect(raven.captureException).toHaveBeenCalledWith(writeError);
                done();
            });
        });

        it('If a writer throws an exception, we still call subsequent writers', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            spaceFiller.fillSpace(rules, function () {
                throw writeError;
            });
            spaceFiller.fillSpace(rules, done);
        });

        it('If a writer throws an exception, the promise is resolved with "false"', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var insertion = spaceFiller.fillSpace(rules, function () {
                throw writeError;
            });

            insertion.then(function (result) {
                expect(result).toBe(false);
                done();
            });
        });

        describe('If spacefinder throws an unexpected error', function () {
            var insertion;
            var writer = jasmine.createSpy('mockWriter');
            var spaceFinderError = new Error('spacefinder went awry');

            beforeEach(function () {
                spacefinderResult = Promise.reject(spaceFinderError);
                insertion = spaceFiller.fillSpace(rules, writer);
            });

            it('Does not call the writer', function (done) {
                insertion.then(function () {
                    expect(writer).not.toHaveBeenCalled();
                    done();
                });
            });

            it('Resolves the promise with "false"', function (done) {
                insertion.then(function (result) {
                    expect(result).toBe(false);
                    done();
                });
            });

            it('Records the exception', function (done) {
                insertion.then(function () {
                    expect(raven.captureException).toHaveBeenCalledWith(spaceFinderError);
                    done();
                });
            });
        });
    });
});
