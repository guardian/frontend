define([
    'underscore',
    'utils/mediator'
], function (
    _,
    mediator
) {
    // Default response, if missing the application navigates away
    var mockResponse = {
        'facia-tool-disable': false,
        'facia-tool-draft-content': true,
        'facia-tool-sparklines': false
    };

    $.mockjax({
        url: "/switches",
        response: function (req) {
            this.responseText = mockResponse;
        },
        onAfterComplete: function () {
            mediator.emit('mock:switches');
        }
    });

    return {
        set: function (response) {
            mockResponse = response;
        },
        override: function (keys) {
            mockResponse = _.extend(mockResponse, keys);
        }
    };
});
