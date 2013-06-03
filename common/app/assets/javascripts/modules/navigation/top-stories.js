define(['common', 'ajax', 'bonzo', 'modules/lazyload'], function (common, ajax, bonzo, lazyLoad) {

    function TopStories() {

        var self = this;

        this.load = function (config, context) {

            var url = '/top-stories/trails?page-size=10&view=link',
                container = context.querySelector('.nav-panel--topstories');

            if(container) {
                if (config.pathPrefix) {
                    url = config.pathPrefix + url;
                }
                lazyLoad({
                    url: url,
                    container: container,
                    jsonpCallbackName: 'navigation',
                    beforeInsert: function (html) {
                        return html;
                    },
                    success: function (json) {
                        common.mediator.emit('modules:topstories:loaded');
                    }
                });

            }
        };

    }

    return TopStories;

});
