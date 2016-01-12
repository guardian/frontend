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

                spyOn(spaceFinder, 'findSpace').and.callFake(function () {
                    return new Promise.resolve(mockSpacefinderResult);
                });

                spyOn(raven, 'captureException');

                done();
            });
        });

        it('Returns a promise that resolves when the insertion completes', function (done) {
            mockSpacefinderResult = null;
            var insertion = spaceFiller.fillSpace(mockRules, function mockWriter() {});
            expect(insertion).toEqual(jasmine.any(Promise));
            insertion.then(done);
        });

        it('Passes a ruleset to the spacefinder', function (done) {
            var insertion = spaceFiller.fillSpace(mockRules, function mockWriter() {});
            insertion.then(function () {
                var spaceFinderArgs = spaceFinder.findSpace.calls.mostRecent().args;
                expect(spaceFinderArgs[0]).toBe(mockRules);
                done();
            });
        });

        it('If it finds a space, it calls the writer', function (done) {
            mockSpacefinderResult = document.createElement('p');
            spaceFiller.fillSpace(mockRules, function mockWriter() {
                done();
            });
        });

        it('If it finds a space, it resolves the promise with the return value of the writer', function (done) {
            mockSpacefinderResult = document.createElement('p');
            var insertion = spaceFiller.fillSpace(mockRules, function () { return true; });

            insertion.then(function onFulfilled(resolution) {
                expect(resolution).toBe(true);
                done();
            });
        });

        it('If there are no spaces, it rejects the promise and does not call the writer', function (done) {
            mockSpacefinderResult = new Promise(function (resolve, reject) { reject(new Error('oops')); });
            var mockWriter = jasmine.createSpy('mockWriter'),
            insertion = spaceFiller.fillSpace(mockRules, mockWriter);

            insertion.then(function (insertionRejection) {
                expect(insertionRejection).toBe(false);
                expect(mockWriter).not.toHaveBeenCalled();
                done();
            });
        });

        it('Calls writers in order', function (done) {
            // This resolves a longstanding race condition where spacefinder calls would come
            // before the scripts that inject content into spaces had completely ran
            mockSpacefinderResult = document.createElement('p');
            var firstWriter = jasmine.createSpy('first write');

            spaceFiller.fillSpace(mockRules, firstWriter);
            spaceFiller.fillSpace(mockRules, function secondWriter() {
                expect(firstWriter).toHaveBeenCalled();
                done();
            });
        });

        it('If a writer throws an exception, we record it', function (done) {
            mockSpacefinderResult = document.createElement('p');
            var insertion = spaceFiller.fillSpace(mockRules, function () {
                throw mockException;
            });

            insertion.then(function () {
                expect(raven.captureException).toHaveBeenCalledWith(mockException);
                done();
            });
        });

        it('If a writer throws an exception, we still call subsequent writers', function (done) {
            mockSpacefinderResult = document.createElement('p');
            spaceFiller.fillSpace(mockRules, function () {
                throw mockException;
            });
            spaceFiller.fillSpace(mockRules, done);
        });

        it('If a writer throws an exception, the promise is resolved with "false"', function (done) {
            mockSpacefinderResult = document.createElement('p');
            var insertion = spaceFiller.fillSpace(mockRules, function () {
                throw mockException;
            });

            insertion.then(function (result) {
                expect(result).toBe(false);
                done();
            });
        });
    });
});
