define([
    'common',
    'bonzo',
    'modules/detect'
], function (common, bonzo, detect) {

    function init(config, context, options) {

        if (!detect.hasWebSocket()) {
            return;
        }

        var chatSocket = new window.WebSocket(config.page.onwardWebSocket);

        var receiveEvent = function(event) {
            if (event && 'data' in event) {
                var data = JSON.parse(event.data);

                if (data.error) {
                    chatSocket.close();
                } else {
                    var $pushedContent = bonzo.create('<div>' + data.headline + ' ' + data.url + '</div>');
                    bonzo($pushedContent).addClass('pushed-content lazyloaded');
                    common.$g(".monocolumn-wrapper").after($pushedContent);
                }
            } else {
                common.mediator.emit('module:error', 'Invalid data returned from socket, module/websocket.js');
            }
        };

        chatSocket.onmessage = receiveEvent;
    }

    return {
        init: init
    };
});
