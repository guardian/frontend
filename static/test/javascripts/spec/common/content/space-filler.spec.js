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
            mockRules = {},
            mockSpacefinderResult,
            mockException = new Error('Mock writer exception');

        beforeEach(function (done) {
            injector.require([
                'common/modules/article/space-filler',
                'common/modules/article/spacefinder',
                'raven'
            ], function () {
                spaceFiller = arguments[0];
                spaceFinder = arguments[1];
                raven = arguments[2];

                spaceFiller = new spaceFiller.constructor(spaceFinder);

                spyOn(spaceFinder, 'getParaWithSpace').and.callFake(function () {
                    return new Promise.resolve(mockSpacefinderResult);
                });

                spyOn(raven, 'captureException');

                done();
            });
        });

        it('Returns a promise that resolves when the insertion completes', function (done) {
            mockSpacefinderResult = null;
            var insertion = spaceFiller.insertAtFirstSpace(mockRules, function mockWriter() {});
            expect(insertion).toEqual(jasmine.any(Promise));
            insertion.then(done);
        });

        it('Passes a ruleset and a debug flag to the spacefinder', function (done) {
            var insertion = spaceFiller.insertAtFirstSpace(mockRules, function mockWriter() {}, true);
            insertion.then(function () {
                var spaceFinderArgs = spaceFinder.getParaWithSpace.calls.mostRecent().args;
                expect(spaceFinderArgs[0]).toBe(mockRules);
                expect(spaceFinderArgs[1]).toBe(true);
                done();
            });
        });

        it('If it finds a space, it calls the writer', function (done) {
            mockSpacefinderResult = document.createElement('p');
            spaceFiller.insertAtFirstSpace(mockRules, function mockWriter() {
                done();
            });
        });

        it('If it finds a space, it resolves the promise with `true`', function (done) {
            mockSpacefinderResult = document.createElement('p');
            var insertion = spaceFiller.insertAtFirstSpace(mockRules, function () {});

            insertion.then(function onFulfilled(resolution) {
                expect(resolution).toBe(true);
                done();
            });
        });

        it('If there are no spaces, it resolves the promise with "false" and does not call the writer', function (done) {
            var mockWriter = jasmine.createSpy('mockWriter'),
            insertion = spaceFiller.insertAtFirstSpace(mockRules, mockWriter);
            mockSpacefinderResult = null;

            insertion.then(function (insertionResult) {
                expect(insertionResult).toBe(false);
                expect(mockWriter).not.toHaveBeenCalled();
                done();
            });
        });

        it('Calls writers in order', function (done) {
            // This resolves a longstanding race condition where spacefinder calls would come
            // before the scripts that inject content into spaces had completely ran
            mockSpacefinderResult = document.createElement('p');
            var firstWriter = jasmine.createSpy('first write');

            spaceFiller.insertAtFirstSpace(mockRules, firstWriter);
            spaceFiller.insertAtFirstSpace(mockRules, function secondWriter() {
                expect(firstWriter).toHaveBeenCalled();
                done();
            });
        });

        it('If a writer throws an exception, we record it', function (done) {
            mockSpacefinderResult = document.createElement('p');
            var insertion = spaceFiller.insertAtFirstSpace(mockRules, function () {
                throw mockException;
            });

            insertion.then(function () {
                expect(raven.captureException).toHaveBeenCalledWith(mockException);
                done();
            });
        });

        it('If a writer throws an exception, we still call subsequent writers', function (done) {
            mockSpacefinderResult = document.createElement('p');
            spaceFiller.insertAtFirstSpace(mockRules, function () {
                throw mockException;
            });
            spaceFiller.insertAtFirstSpace(mockRules, done);
        });
    });
});
