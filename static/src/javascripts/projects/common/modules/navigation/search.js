define([
    'bean',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/modules/experiments/ab'
], function (
    bean,
    fastdom,
    _,
    $,
    config,
    ab
) {
    var Search = function () {

        var searchLoader,
            enabled,
            gcsUrl,
            resultSetSize,
            container,
            self = this,
            checkInterval;

        if (config.switches.googleSearch && config.page.googleSearchUrl && config.page.googleSearchId) {

            enabled = true;
            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
            resultSetSize = config.page.section === 'identity' ? 3 : 10;

            searchLoader = _.throttle(function () {
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

                if (ab.shouldRunTest('Viewability', 'variant') && config.page.contentType !== 'Interactive') {
                    clearInterval(checkInterval);
                    checkInterval = setInterval(self.checkResults, 250);
                }
            }
        };

        // Check if google returned results as there is no callback from google API v2 for this
        this.checkResults = function () {
            if ($('.gsc-resultsbox-visible').length > 0) {
                fastdom.read(function () {
                    var height = window.innerHeight - $('.popup--search').offset().top;

                    fastdom.write(function () {
                        $('.popup--search').css('height', height);
                        $('.gsc-results').css({
                            height: height - 150,
                            'overflow-y': 'auto'
                        });
                    });
                    clearInterval(checkInterval);
                });
            }
        };

        this.load = function () {
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
                            '<gcse:searchresults webSearchResultSetSize="' + resultSetSize + '"></gcse:searchresults>' +
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
