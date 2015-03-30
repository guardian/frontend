define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var stories = {};

    $.mockjax({
        url: /\/stories-visible\/(.+)/,
        urlParams: ['collection'],
        response: function (req) {
            var response = stories[req.urlParams.collection];
            if (!response) {
                response = {
                    status: 'fail'
                };
            }
            this.responseText = response;
        },
        onAfterComplete: function () {
            mediator.emit('mock:stories-visible');
        }
    });

    return {
        set: function (response) {
            stories = _.extend(stories, response);
        }
    };
});
