define([
    'mock/config'
], function (
    mockConfig
) {
    return function (action) {
        var lastRequest, desiredAnswer;
        var interceptFront = $.mockjax({
            url: '/config/fronts',
            type: 'post',
            response: function (request) {
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                clearRequest();
                // Every such action is also triggering an update of the config
                jasmine.clock().tick(100);
                deferred.resolve(lastRequest);
            }
        });
        var interceptEdit = $.mockjax({
            url: /config\/fronts\/(.+)/,
            urlParams: ['front'],
            type: 'post',
            response: function (request) {
                lastRequest = request;
                lastRequest.data = JSON.parse(request.data);
                lastRequest.front = request.urlParams.front;
                this.responseText = desiredAnswer;
            },
            onAfterComplete: function () {
                clearRequest();
                // Every such action is also triggering an update of the config
                jasmine.clock().tick(100);
                deferred.resolve(lastRequest);
            }
        });

        function clearRequest () {
            $.mockjax.clear(interceptFront);
            $.mockjax.clear(interceptEdit);
        }

        var deferred = new $.Deferred();
        desiredAnswer = action();
        mockConfig.update(desiredAnswer);

        // This action triggers a network request, advance time
        jasmine.clock().tick(100);

        return deferred.promise();
    };
});
