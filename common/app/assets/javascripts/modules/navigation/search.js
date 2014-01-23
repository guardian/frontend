define([
    'common/$',
    'common/common',
    'bean'
], function (
    $,
    common,
    bean
) {

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

            bean.on(document, 'click touchstart', '.control--search', function(e) {
                searchLoader();
                self.focusSearchField();
                e.preventDefault();
            });

            bean.on(document, 'click touchstart', '.search-results', function(e) {
                var targetEl = e.target;
                if (targetEl.nodeName.toLowerCase() === "a") {
                    targetEl.target = "_self";
                }
            });
        }

        this.focusSearchField = function() {
            var $input = $('input.gsc-input');
            if ($input.length > 0) {
                $input.focus();
            }
        };

        this.load = function() {
            var s,
                x;

            container = currentContext.querySelector('.nav-popup-search');

            // Set so Google know what to do
            window.__gcse = {
                callback: self.focusSearchField
            };

            // Unload any search placeholders elsewhere in the DOM
            Array.prototype.forEach.call(document.querySelectorAll('.nav-popup-search'), function(c){
                if (c !== container) {
                    c.innerHTML = '';
                }
            });

            // Load the Google search monolith, if not already present in this context.
            // We have to re-run their script each time we do this.
            if (!container.innerHTML) {
                container.innerHTML = '' +
                    '<div class="search-box" role="search">' +
                        '<gcse:searchbox></gcse:searchbox>' +
                    '</div>' +
                    '<div class="search-results" data-link-name="search">' +
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
