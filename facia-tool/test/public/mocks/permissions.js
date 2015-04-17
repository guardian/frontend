define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var mockResponse = {};

    $.mockjax({
        url: '/acl',
        type: 'get',
        response: function (req) {
            this.responseText = mockResponse;
        },
        onAfterComplete: function () {
            mediator.emit('mock:permissions');
        }
    });

    return {
        set: function (response) {
            mockResponse = response;
        }
    };
});
