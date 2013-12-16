define([
    '$',
    'bean'
], function (
    $,
    bean
) {

    function FormstackIframe(el, context, config) {

        var self = this;

        self.init = function() {
            // Setup postMessage listener for events from "modules/identity/formstack"
            bean.on(window, 'message', function(event) {
                if (event.origin === config.page.idUrl) {
                    self.onMessage(event);
                } else {
                    return;
                }
            });
        };

        self.onMessage = function(event) {
            switch (event.data) {
                case "ready":
                    self.show();
                    break;

                case "refreshHeight":
                    self.refreshHeight();
                    break;
            }
        };

        self.refreshHeight = function() {
            var iframe = el.contentWindow.document,
                body = iframe.body,
                html = iframe.documentElement,
                height = Math.max(body.scrollHeight, body.offsetHeight,
                                  html.clientHeight, html.scrollHeight, html.offsetHeight);

            $(el).css({ 'height': height });
        };

        self.show = function() {
            $(el).removeClass('u-h');
        };

    }

    return FormstackIframe;

});
