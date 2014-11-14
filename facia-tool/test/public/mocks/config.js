define('mock-config', ['utils/mediator'], function (
    mediator
) {
    // Default response, if missing the application navigates away
    var mockResponse = {
        fronts: {},
        collections: {}
    };

    $.mockjax({
        url: '/config',
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
        }
    };
});
