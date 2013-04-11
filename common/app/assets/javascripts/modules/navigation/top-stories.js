define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function TopStories() {

        // View

        this.view = {

            render: function (html) {

                var topstoriesHeader = document.getElementById('topstories-header'),
                    $topstoriesHeader = bonzo(topstoriesHeader),
                    className = "is-off";

                topstoriesHeader.innerHTML = '<h3 class="headline-list__tile type-5">Top stories</h3>'
                    + '<div class="headline-list headline-list--top box-indent" data-link-name="top-stories">'
                    + html
                    + '</div>';

                common.mediator.emit('modules:topstories:render');

                common.mediator.on('modules:control:change:topstories-control-header:true', function(args) {
                    $topstoriesHeader.removeClass(className);
                });

                common.mediator.on('modules:control:change', function(args) {

                    var control = args[0],
                        state = args[1];

                    if (state === false || control !== 'topstories-control-header') {
                        $topstoriesHeader.addClass(className);
                    }
                });
            }
        };

        // Bindings

        common.mediator.on('modules:topstories:loaded', this.view.render);

        // Model

        this.load = function (config) {

            var url = '/top-stories.json?page-size=10&view=link';

            if (config.pathPrefix) {
                url = config.pathPrefix + url;
            }

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
