define(function () {
    return function (action) {
        var deferred = $.Deferred();

        var publishedCollection;
        var publishInterceptor = $.mockjax({
            url: /collection\/publish\/(.+)/,
            urlParams: ['collection'],
            type: 'post',
            responseText: '',
            response: function (request) {
                publishedCollection = request.urlParams.collection;
            },
            onAfterComplete: function () {
                $.mockjax.clear(publishInterceptor);
                deferred.resolve(publishedCollection);
            }
        });
        action();

        return deferred.promise();
    };
});
