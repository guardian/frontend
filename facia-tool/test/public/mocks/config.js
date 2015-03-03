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
    }, id;

    function use () {
        id = $.mockjax({
            url: '/config',
            type: 'get',
            response: function (req) {
                this.responseText = mockResponse;
            },
            onAfterComplete: function () {
                mediator.emit('mock:config');
            }
        });
    }

    return {
        set: function (response) {
            mockResponse = response;
            if (!id) {
                use();
            }
        },
        update: function (response) {
            _.extend(mockResponse.fronts, response.fronts);
            _.extend(mockResponse.collections, response.collections);
            if (!id) {
                use();
            }
        },
        clear: function () {
            if (id) {
                $.mockjax.clear(id);
                id = null;
            }
        }
    };
});
