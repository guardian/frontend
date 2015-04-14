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
    }, id;

    function use () {
        id = $.mockjax({
            url: "/switches",
            response: function (req) {
                this.responseText = mockResponse;
            },
            onAfterComplete: function () {
                mediator.emit('mock:switches');
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
        update: function (keys) {
            mockResponse = _.extend(mockResponse, keys);
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
