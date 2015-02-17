define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    // Default response, if missing the application navigates away
    var mockResponse = {
        fronts: {},
        collections: {}
    };

    $.mockjax({
        url: '/config',
        type: 'get',
        response: function (req) {
            this.responseText = mockResponse;
        },
        onAfterComplete: function () {
            mediator.emit('mock:config');
        }
    });

    return {
        set: function (response) {
            mockResponse = response;
        },
        update: function (response) {
            _.extend(mockResponse.fronts, response.fronts);
            _.extend(mockResponse.collections, response.collections);
        }
    };
});
