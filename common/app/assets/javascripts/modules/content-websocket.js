define([
    'common',
    'bonzo'
], function (common, bonzo) {

    function init(config, context, options) {

        var WS = window.MozWebSocket ? window.MozWebSocket : WebSocket;
        var chatSocket = new WS(config.page.onwardWebSocket);

        var receiveEvent = function(event) {
            var data = JSON.parse(event.data);

            if (data.error) {
                chatSocket.close();
            } else {
                var $pushedContent = bonzo.create('<div>' + data.headline + ' ' + data.url + '</div>');
                bonzo($pushedContent).addClass('pushed-content lazyloaded');
                common.$g(".monocolumn-wrapper").after($pushedContent);
            }
        };

        chatSocket.onmessage = receiveEvent;
    }

    return {
        init: init
    };
});
