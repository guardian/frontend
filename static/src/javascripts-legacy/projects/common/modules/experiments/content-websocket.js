define([
    'bonzo',
    'lib/$',
    'lib/detect',
    'lib/raven'
], function (
    bonzo,
    $,
    detect,
    raven
) {
    function connect(config) {

        if (!detect.hasWebSocket()) {
            return;
        }

        var $pushedContent,
            chatSocket   = new window.WebSocket(config.page.onwardWebSocket),
            receiveEvent = function (event) {

                if (event && 'data' in event) {
                    var data = JSON.parse(event.data);

                    if (data.error) {
                        chatSocket.close();
                    } else {
                        $pushedContent = bonzo.create('<div>' + data.headline + ' ' + data.url + '</div>');
                        bonzo($pushedContent).addClass('pushed-content lazyloaded');
                        $('.monocolumn-wrapper').after($pushedContent);
                    }
                } else {
                    raven.captureMessage('Invalid data returned from socket');
                }
            },
            disconnectEvent = function () {
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
