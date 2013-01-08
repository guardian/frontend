define(['common', 'reqwest', 'bonzo'], function (common, reqwest, bonzo) {

    function TopStories() {

        // View

        this.view = {

            render: function (html) {

                var topstoriesHeader = document.getElementById('topstories-header'),
                    topstoriesNav = common.$g('.topstories-control');

                topstoriesHeader.innerHTML = html;

                common.mediator.emit('modules:topstories:render');

                common.mediator.on('modules:control:change:topstories-control-header:true', function(args) {
                    bonzo(topstoriesHeader).removeClass('is-off');
                });

                common.mediator.on('modules:control:change', function(args) {

                    var control = args[0],
                        state = args[1];

                    if (state === false || control !== 'topstories-control-header') {
                        bonzo(topstoriesHeader).addClass('is-off');
                    }

                });

            }

        };

        // Bindings

        common.mediator.on('modules:topstories:loaded', this.view.render);

        // Model

        this.load = function (config) {
            var url = config.page.coreNavigationUrl + '/top-stories?page-size=10';
            return reqwest({
                    url: url,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'navigation',
                    success: function (json) {
                        common.mediator.emit('modules:topstories:loaded', [json.html]);
                    }
                });
        };

    }

    return TopStories;

});
