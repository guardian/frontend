define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var lastModified = {};

    $.mockjax({
        url: /\/front\/lastmodified\/(.+)/,
        urlParams: ['front'],
        response: function (req) {
            var response = lastModified[req.urlParams.front];
            if (!response) {
                response = {
                    status: 'fail'
                };
            }
            this.responseText = response;
        },
        onAfterComplete: function () {
            mediator.emit('mock:lastmodified');
        }
    });

    return {
        set: function (response) {
            lastModified = _.extend(lastModified, response);
        }
    };
});
