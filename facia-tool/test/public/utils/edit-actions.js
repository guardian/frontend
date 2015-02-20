define([
    'mock/collection'
], function (
    mockCollection
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
                deferred.resolve(lastRequest);
            }
        });
        var deferred = new $.Deferred();
        desiredAnswer = action();

        // Soon after an edit, there'll be a call to refresh the collection
        for (var name in desiredAnswer) {
            desiredAnswer[name].lastUpdated = (new Date()).toISOString();
        }
        mockCollection.set(desiredAnswer);

        // This action triggers a network request, advance time
        jasmine.clock().tick(100);

        return deferred.promise();
    };
});
