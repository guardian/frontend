define(['bean', 'lib/$', 'lib/mediator'], function(bean, $, mediator) {
    function FormstackIframe(el, config) {
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

            mediator.on('window:throttledResize', self.refreshHeight);

            // Listen for load of form confirmation or error page,
            // which has no form, so won't instantiate the Formstack module
            bean.on(el, 'load', function() {
                self.show();
                self.refreshHeight();
            });
        };

        self.onMessage = function(event) {
            switch (event.data) {
                case 'ready':
                    self.show();
                    self.refreshHeight();
                    break;

                case 'unload':
                    self.refreshHeight(true);
                    break;

                case 'refreshHeight':
                    self.refreshHeight();
                    break;
            }
        };

        self.refreshHeight = function(reset) {
            if (reset) {
                // If a height is set on the iframe, the following calculation
                // will be at least that height, optionally reset first
                $(el).css({ height: 0 });
            }

            var iframe = el.contentWindow.document,
                body = iframe.body,
                html = iframe.documentElement,
                height = Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    html.clientHeight,
                    html.scrollHeight,
                    html.offsetHeight
                );

            $(el).css({ height: height });
        };

        self.show = function() {
            $(el).removeClass('is-hidden');
        };
    }

    return FormstackIframe;
});
