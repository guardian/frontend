define([
    'bean',
    'fastdom',
    'lodash/functions/throttle',
    'common/utils/$',
    'common/utils/config'
], function (
    bean,
    fastdom,
    throttle,
    $,
    config
) {

    var Search = function () {

        var searchLoader,
            enabled,
            gcsUrl,
            container,
            self = this;

        if (config.switches.googleSearch && config.page.googleSearchUrl && config.page.googleSearchId) {

            enabled = true;
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;

            searchLoader = throttle(function () {
                self.load();
            });

            bean.on(document, 'click', '.js-search-toggle', function (e) {
                searchLoader();
                self.focusSearchField();
                e.preventDefault();
            });

            bean.on(document, 'click', '.search-results', function (e) {
                var targetEl = e.target;
                if (targetEl.nodeName.toLowerCase() === 'a') {
                    targetEl.target = '_self';
                }
            });
        }

        this.focusSearchField = function () {
            var $input = $('input.gsc-input');
            if ($input.length > 0) {
                $input.focus();
            }
        };

        this.load = function () {
            /* jscs:disable disallowDanglingUnderscores */
            var s,
                x;

            container = document.body.querySelector('.js-search-placeholder');

            // Set so Google know what to do
            window.__gcse = {
                callback: self.focusSearchField
            };

            // Unload any search placeholders elsewhere in the DOM
            Array.prototype.forEach.call(document.querySelectorAll('.js-search-placeholder'), function (c) {
                if (c !== container) {
                    fastdom.write(function () {
                        c.innerHTML = '';
                    });
                }
            });

            // Load the Google search monolith, if not already present in this context.
            // We have to re-run their script each time we do this.
            if (!container.innerHTML) {
                fastdom.write(function () {
                    container.innerHTML = '' +
                        '<div class="search-box" role="search">' +
                            '<gcse:searchbox></gcse:searchbox>' +
                        '</div>' +
                        '<div class="search-results" data-link-name="search">' +
                            '<gcse:searchresults></gcse:searchresults>' +
                        '</div>';
                });

                s = document.createElement('script');
                s.async = true;
                s.src = gcsUrl;
                x = document.getElementsByTagName('script')[0];
                fastdom.write(function () {
                    x.parentNode.insertBefore(s, x);
                });
            }
        };

        this.init = function () { };

    };

    return Search;
});
