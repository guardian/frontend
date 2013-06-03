define(['common', 'bean', 'modules/detect'], function (common, bean, detect) {

    var Search = function (config) {

        var enabled,
            gcsUrl,
            currentContext,
            container,
            self = this;

        if (config.switches.googleSearch && config.page.googleSearchUrl && config.page.googleSearchId) {

            enabled = true;
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;

            var searchLoader = common.rateLimit(function() {
                self.load();
            });

            var clickBinding = function(e) {
                searchLoader();
                e.preventDefault();
            };

            bean.on(document, 'click touchstart', '.control--sections', clickBinding);
            bean.on(document, 'click touchstart', '.control--search', clickBinding);

            bean.on(document, 'click touchstart', '.search-results', function(e) {
                var targetEl = e.target;
                if (targetEl.nodeName.toLowerCase() === "a") {
                    targetEl.target = "_self";
                }
            });
        }

        this.load = function(context) {
            var layout = detect.getLayoutMode(),
                containerClass = (layout === "mobile") ? '.js-search--sections' : '.js-search--popup',
                container = currentContext.querySelector(containerClass),
                s,
                x;

            // Unload any search placeholders elsewhere in the DOM
            Array.prototype.forEach.call(document.querySelectorAll('.search'), function(c){
                if (c !== container) {
                    c.innerHTML = '';
                }
            });

            // Load the Google search monolith, if not already present in this context.
            // We have to re-run their script each time we do this.
            if (! container.innerHTML) {
                container.innerHTML = '' +
                    '<div class="search__box" role="search">' +
                        '<gcse:searchbox></gcse:searchbox>' +
                    '</div>' +
                    '<div class="search__results" data-link-name="search">' +
                        '<gcse:searchresults></gcse:searchresults>' +
                    '</div>';

                s = document.createElement('script');
                s.async = true;
                s.src = gcsUrl;
                x = document.getElementsByTagName('script')[0];
                x.parentNode.insertBefore(s, x);
            }
        };

        this.init = function(context) {
            if (enabled) {
                currentContext = context;
            }
        };

    };

    return Search;
});
