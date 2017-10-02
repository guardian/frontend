define([
    'bean',
    'fastdom',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lodash/functions/throttle'
], function (
    bean,
    fastdom,
    $,
    config,
    detect,
    throttle
) {

    var Search = function () {
        var toggle = document.querySelector('.js-search-toggle');
        var searchLoader,
            gcsUrl,
            resultSetSize,
            container,
            self = this;

        if (config.switches.googleSearch &&
            config.page.googleSearchUrl &&
            config.page.googleSearchId &&
            toggle) {

            gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
            resultSetSize = config.page.section === 'identity' ? 3 : 10;

            searchLoader = throttle(function () {
                self.load();
            });

            bean.on(toggle, 'click', function (e) {
                var popup = document.querySelector('.js-search-popup');
                var maybeDismissSearchPopup = function(event) {
                    var el = event.target;
                    var clickedPop = false;

                    while (el && !clickedPop) {
                        /* either the search pop-up or the autocomplete resultSetSize
                           NOTE: it would be better to check for `.gssb_c`,
                                 which is the outer autocomplete element, but
                                 google stops the event bubbling earlier
                        */
                        if (el && el.classList &&
                            (el.classList.contains('js-search-popup') ||
                             el.classList.contains('gsq_a'))) {
                            clickedPop = true;
                        }

                        el = el.parentNode;
                    }

                    if (!clickedPop) {
                        event.preventDefault();
                        toggle.classList.remove('is-active');
                        popup.classList.add('is-off');
                        bean.off(document, 'click', maybeDismissSearchPopup);
                    }
                };

                setTimeout(function() {
                    if (toggle.classList.contains('is-active')) {
                        bean.on(document, 'click', maybeDismissSearchPopup);
                    }
                })

                searchLoader();
                // Make sure search is always in the correct state
                self.focusSearchField();
                e.preventDefault();
            });
        }

        this.focusSearchField = function () {
            var $input = $('input.gsc-input');
            if ($input.length > 0) {
                $input.focus();
            }
        };

        this.load = function () {
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

                bean.on(container, 'keydown', '.gsc-input', function () {
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

                bean.on(container, 'click', '.search-results', function (e) {
                    var targetEl = e.target;
                    if (targetEl.nodeName.toLowerCase() === 'a') {
                        targetEl.target = '_self';
                    }
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
