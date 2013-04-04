define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Search = function (config) {

        var gcsUrl,
            searchHeader = document.getElementById('search-header'),
            $searchHeader = bonzo(searchHeader),
            className = "is-off" ,
            loaded = false,
            that = this;

        // View
        this.view = {

            bindings: function() {
                common.mediator.on('modules:control:change:search-control-header:true', function() {
                    that.view.show();
                });

                common.mediator.on('modules:control:change', function(args) {

                    var control = args[0],
                        state = args[1];

                    if (state === false) {
                        that.view.hide();
                    }
                });
            },

            show: function() {
                $searchHeader.removeClass(className);
            },

            hide: function() {
                $searchHeader.addClass(className);
            }
        };

        this.load = function() {
            if (config.switches.googleSearch && gcsUrl) {
                require(['js!' + gcsUrl + '!order'], function () {
                    bean.on(document.querySelector('.search-results'), 'click', function(e) {
                        var targetEl = e.target;
                        if (targetEl.nodeName.toLowerCase() === "a") {
                            targetEl.target = "_self";
                        }
                    });
                });
            }
        };

        this.init = function() {
            if (config.page.googleSearchUrl && config.page.googleSearchId) {
                gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
                this.load();
            }

            this.view.bindings();
        };

    };

    return Search;
});
