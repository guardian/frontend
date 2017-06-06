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
            injector.mock('common/modules/spacefinder', {
              findSpace: function () {},
              SpaceError: function () { this.name = 'SpaceError'; }
            });

            injector.require([
                'common/modules/article/space-filler',
                'common/modules/spacefinder',
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
            insertion.then(done).catch(done.fail);
        });

        it('Passes a ruleset to the spacefinder', function (done) {
            var insertion = spaceFiller.fillSpace(rules, function writer() {});
            insertion.then(function () {
                var spaceFinderArgs = spaceFinder.findSpace.calls.mostRecent().args;
                expect(spaceFinderArgs[0]).toBe(rules);
                done();
            })
            .catch(done.fail);
        });

        it('If it finds a space, it calls the writer', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            spaceFiller.fillSpace(rules, done).catch(done.fail);
        });

        it('If there are no spaces, it rejects the promise and does not call the writer', function (done) {
            spacefinderResult = Promise.reject(new spaceFinder.SpaceError({}));

            var mockWriter = jasmine.createSpy('mockWriter');
            var insertion = spaceFiller.fillSpace(rules, mockWriter);

            insertion.then(function (result) {
                expect(result).toBe(false);
                expect(mockWriter).not.toHaveBeenCalled();
                done();
            })
            .catch(done.fail);
        });

        it('If there are no spaces, the spacefinder exception is not recorded by Raven', function (done) {
            // These exceptions are 'expected' and therefore shouldn't go into logging
            spacefinderResult = Promise.reject(new spaceFinder.SpaceError({}));
            var insertion = spaceFiller.fillSpace(rules, function writer() {});

            insertion.then(function () {
                expect(new spaceFinder.SpaceError({}) instanceof spaceFinder.SpaceError).toBe(true);
                expect(raven.captureException).not.toHaveBeenCalled();
                done();
            })
            .catch(done.fail);
        });

        it('Calls writers in order', function (done) {
            // This resolves a longstanding race condition where spacefinder calls would come
            // before the scripts that inject content into spaces had completely ran
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var firstWriter = jasmine.createSpy('first write');

            spaceFiller.fillSpace(rules, firstWriter)
            .catch(done.fail);
            spaceFiller.fillSpace(rules, function secondWriter() {
                expect(firstWriter).toHaveBeenCalled();
                done();
            })
            .catch(done.fail);
        });

        it('If a writer throws an exception, we record it', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var insertion = spaceFiller.fillSpace(rules, function () {
                throw writeError;
            });

            insertion.then(function () {
                expect(raven.captureException).toHaveBeenCalledWith(writeError);
                done();
            })
            .catch(done.fail);
        });

        it('If a writer throws an exception, we still call subsequent writers', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            spaceFiller.fillSpace(rules, function () {
                throw writeError;
            })
            .catch(done.fail);
            spaceFiller.fillSpace(rules, done)
            .catch(done.fail);
        });

        it('If a writer throws an exception, the promise is resolved with "false"', function (done) {
            spacefinderResult = Promise.resolve(document.createElement('p'));
            var insertion = spaceFiller.fillSpace(rules, function () {
                throw writeError;
            });

            insertion.then(function (result) {
                expect(result).toBe(false);
                done();
            })
            .catch(done.fail);
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
                })
                .catch(done);
            });

            it('Resolves the promise with "false"', function (done) {
                insertion.then(function (result) {
                    expect(result).toBe(false);
                    done();
                })
                .catch(done);
            });

            it('Records the exception', function (done) {
                insertion.then(function () {
                    expect(raven.captureException).toHaveBeenCalledWith(spaceFinderError);
                    done();
                })
                .catch(done);
            });
        });
    });
});
