define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'lodash/functions/throttle'
], function (
    bean,
    fastdom,
    $,
    config,
    detect,
    mediator,
    throttle) {
    var Search = function () {

        var searchLoader,
            gcsUrl,
            resultSetSize,
            container,
            self = this,
            checkInterval;

        if (config.switches.googleSearch && config.page.googleSearchUrl && config.page.googleSearchId) {

            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
            resultSetSize = config.page.section === 'identity' ? 3 : 10;

            searchLoader = throttle(function () {
                self.load();
            });

            bean.on(document, 'click', '.js-search-toggle', function (e) {
                searchLoader();

                // Make sure search is always in the correct state
                self.checkResults();
                self.focusSearchField();
                e.preventDefault();
                mediator.emit('modules:search');
            });

            bean.on(document, 'keydown', '.gsc-input', function () {
                fastdom.read(function () {
                    var $autoCompleteObject = $('.gssb_c'),
                        searchFromTop       = $autoCompleteObject.css('top'),
                        windowOffset        = $(window).scrollTop();

                    fastdom.write(function () {
                        $autoCompleteObject.css({
                            'top': parseInt(searchFromTop, 10) + windowOffset,
                            'z-index': '1030'
                        });
                    });
                });
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

                if (config.switches.viewability && config.page.contentType !== 'Interactive') {
                    clearInterval(checkInterval);
                    checkInterval = setInterval(self.checkResults, 250);
                }
            }
        };

        // Check if google returned results as there is no callback from google API v2 for this
        this.checkResults = function () {
            if ($('.gsc-resultsbox-visible').length > 0) {
                var $search = $('.js-popup--search');

                // Put search box to its default state
                fastdom.write(function () {
                    $search.css('height', 'auto');
                    $('.gsc-results', $search).css({
                        height: 'auto',
                        'overflow-y': 'visible'
                    });
                });

                // Cut search results to window size only when in slim header mode
                if ($('.l-header--is-slim').length > 0 || detect.getBreakpoint() === 'mobile') {
                    fastdom.read(function () {
                        var height = window.innerHeight - $search[0].getBoundingClientRect().top;

                        fastdom.write(function () {
                            $search.css('height', height);
                            $('.gsc-results', $search).css({
                                height: height - 150,
                                'overflow-y': 'auto'
                            });
                        });
                    });
                }

                clearInterval(checkInterval);
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
                            '<gcse:searchresults webSearchResultSetSize="' + resultSetSize + '" linkTarget="_self"></gcse:searchresults>' +
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
