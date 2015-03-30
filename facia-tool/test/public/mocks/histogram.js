define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    var mockResponse = {};

    $.mockjax({
        url: /\/ophan\/histogram\?(.*)/,
        type: 'get',
        urlParams: ['queryString'],
        response: function (req) {
            var front = req.urlParams.queryString.split('&').filter(function (param) {
                return param.split('=')[0] === 'referring-path';
            })[0].split('=')[1];
            this.responseText = mockResponse[front] || {};
        },
        onAfterComplete: function () {
            mediator.emit('mock:histogram');
        }
    });

    return {
        set: function (response) {
            mockResponse = response;
        },
        update: function (response) {
            _.extend(mockResponse, response);
        }
    };
});
