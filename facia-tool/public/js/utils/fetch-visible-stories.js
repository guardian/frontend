define([
    'jquery',
    'underscore',
    'modules/authed-ajax'
], function (
    $,
    _,
    authedAjax
) {
    return function (type, groups) {
        var deferred = new $.Deferred(),
            stories = [];
        _.each(groups, function (group) {
            _.each(group.items(), function (story) {
                stories.push({
                    group: story.group.index,
                    isBoosted: !!story.meta.isBoosted()
                });
            });
        });

        if (!stories.length) {
            deferred.reject(new Error('Empty collection'));
        } else {
            authedAjax.request({
                url: '/stories-visible/' + type,
                method: 'POST',
                data: JSON.stringify({
                    stories: stories
                }),
                dataType: 'json'
            })
            .done(function (result) {
                deferred.resolve(result);
            })
            .fail(function (error) {
                deferred.reject(error);
            });
        }

        return deferred.promise();
    };
});
