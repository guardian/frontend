define(['common', 'bean', 'bonzo'], function (common, bean, bonzo) {

    var Search = function (config) {

        var enabled,
            gcsUrl,
            currentContext,
            self = this,
            delay = 400,
            lastClickTime = 0;


        if (config.switches.googleSearch && config.page.googleSearchUrl && config.page.googleSearchId) {
            
            enabled = true;
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;

            bean.on(document, 'click touchstart', '.control--search', function(e) {
                var current = new Date().getTime();
                var delta = current - lastClickTime;
                if (delta >= delay) {
                    lastClickTime = current;
                    self.load(currentContext);
                }
                e.preventDefault();
            });

            bean.on(document, 'click', '.search-results', function(e) {
                var targetEl = e.target;
                if (targetEl.nodeName.toLowerCase() === "a") {
                    targetEl.target = "_self";
                }
            });
        }

        this.load = function(context) {
            var container = context.querySelector('.nav-popup-search'),
                s,
                x;

            // Unload any search placeholders elsewhere in the DOM
            Array.prototype.forEach.call(document.querySelectorAll('.nav-popup-search'), function(c){
                if (c !== container) {
                    c.innerHTML = '';
                }
            });

            // Load the Google search monolith, if not already present in this context.
            // We have to re-run their script each time we do this.
            if (! container.innerHTML) {
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
