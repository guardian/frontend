define([
    'common',
    'bonzo',
    'modules/detect'
], function (common, bonzo, detect) {

    function connect(config) {

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

        var disconnectEvent = function(event) {
            chatSocket.close();
            connect(config);
        };

        chatSocket.onmessage = receiveEvent;
        chatSocket.onerror = disconnectEvent;
        chatSocket.onclose = disconnectEvent;
    }

    return {
        connect: connect
    };
});
