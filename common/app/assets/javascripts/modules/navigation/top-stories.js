define(['common', 'ajax', 'bonzo', 'modules/lazyload'], function (common, ajax, bonzo, lazyLoad) {

    function TopStories() {

        var self = this;

        this.load = function (config, context) {

            var url = '/top-stories.json?page-size=10&view=link',
                container = context.querySelector('.nav-popup-topstories');

            if(container) {
                if (config.pathPrefix) {
                    url = config.pathPrefix + url;
                }
                lazyLoad({
                    url: url,
                    container: container,
                    jsonpCallbackName: 'navigation',
                    beforeInsert: function (html) {
                        return '' +
                            '<h3 class="headline-list__tile type-5">Top stories</h3>' +
                            '<div class="headline-list headline-list--top box-indent" data-link-name="top-stories">' +
                                html +
                            '</div>';
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
