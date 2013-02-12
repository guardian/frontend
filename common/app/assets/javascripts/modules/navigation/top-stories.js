define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function TopStories() {

        // View

        this.view = {

            render: function (html) {

                var topstoriesHeader = document.getElementById('topstories-header');

                topstoriesHeader.innerHTML = '<div class="headline-list box-indent" data-link-name="top-stories">'
                    + html
                    + '</div>';

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
            var url = config.page.coreNavigationUrl + '/top-stories.json?page-size=10&view=link';
            return ajax({
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
