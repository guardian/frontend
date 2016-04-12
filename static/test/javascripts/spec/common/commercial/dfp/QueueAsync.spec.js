define([
    'helpers/injector',
    'Promise'
], function (
    Injector,
    Promise
) {
    var injector = new Injector();

    describe('QueueAsync', function () {
        var QueueAsync;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/dfp/QueueAsync'
            ], function () {
                QueueAsync = arguments[0];
                done();
            });
        });

        it('Catches exceptions using the provided error handler', function (done) {
            var errorHandler = jasmine.createSpy('errorHandler');
            var queue = new QueueAsync(errorHandler);
            var runBrokenFunction = function () {
                return queue.add(function () {
                    return Promise.reject(new Error('I am broken'));
                });
            };

            runBrokenFunction().then(function () {
                expect(errorHandler).toHaveBeenCalled();
                done();
            });
        });
    });

});
