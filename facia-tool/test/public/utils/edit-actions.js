define([
    'mock-collection',
    'utils/mediator'
], function (
    mockCollection,
    mediator
) {
    return function (action) {
        var lastRequest, desiredAnswer;
        var interceptor = $.mockjax({
            url: "/edits",
            response: function (request) {
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                $.mockjax.clear(interceptor);
                resolve();
            }
        });
        mediator.once('mock:collection', function () {
            resolve();
        });
        mediator.once('mock:search', function () {
            resolve();
        });
        var deferred = new $.Deferred();

        // After an edit there's a collection refresh, wait for both
        // The refresh is either a /collection or a /search
        var resolve = _.after(2, _.once(function () {
            deferred.resolve(lastRequest);
        }));

        desiredAnswer = action();

        // Soon after an edit, there'll be a call to refresh the collection
        mockCollection.set(desiredAnswer);

        return deferred.promise();
    };
});
