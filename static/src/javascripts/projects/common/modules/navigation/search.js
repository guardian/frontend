import bean from 'bean';
import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import throttle from 'lodash/functions/throttle';

const Search = function() {
    const toggle = document.querySelector('.js-search-toggle');
    let searchLoader;
    let gcsUrl;
    let resultSetSize;
    let container;
    const self = this;

    if (config.switches.googleSearch &&
        config.page.googleSearchUrl &&
        config.page.googleSearchId &&
        toggle) {

        gcsUrl = config.page.googleSearchUrl + '?cx=' + config.page.googleSearchId;
        resultSetSize = config.page.section === 'identity' ? 3 : 10;

        searchLoader = throttle(() => {
            self.load();
        });

        bean.on(toggle, 'click', e => {
            const popup = document.querySelector('.js-search-popup');
            const maybeDismissSearchPopup = event => {
                let el = event.target;
                let clickedPop = false;

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

            setTimeout(() => {
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

    this.focusSearchField = () => {
        const $input = $('input.gsc-input');
        if ($input.length > 0) {
            $input.focus();
        }
    };

    this.load = () => {
        let s, x;

        container = document.body.querySelector('.js-search-placeholder');

        // Set so Google know what to do
        window.__gcse = {
            callback: self.focusSearchField
        };

        // Unload any search placeholders elsewhere in the DOM
        Array.prototype.forEach.call(document.querySelectorAll('.js-search-placeholder'), c => {
            if (c !== container) {
                fastdom.write(() => {
                    c.innerHTML = '';
                });
            }
        });

        // Load the Google search monolith, if not already present in this context.
        // We have to re-run their script each time we do this.
        if (!container.innerHTML) {
            fastdom.write(() => {
                container.innerHTML = '' +
                    '<div class="search-box" role="search">' +
                    '<gcse:searchbox></gcse:searchbox>' +
                    '</div>' +
                    '<div class="search-results" data-link-name="search">' +
                    '<gcse:searchresults webSearchResultSetSize="' + resultSetSize + '" linkTarget="_self"></gcse:searchresults>' +
                    '</div>';
            });

            bean.on(container, 'keydown', '.gsc-input', () => {
                fastdom.read(() => {
                    const $autoCompleteObject = $('.gssb_c'), searchFromTop = $autoCompleteObject.css('top'), windowOffset = $(window).scrollTop();

                    fastdom.write(() => {
                        $autoCompleteObject.css({
                            'top': parseInt(searchFromTop, 10) + windowOffset,
                            'z-index': '1030'
                        });
                    });
                });
            });

            bean.on(container, 'click', '.search-results', e => {
                const targetEl = e.target;
                if (targetEl.nodeName.toLowerCase() === 'a') {
                    targetEl.target = '_self';
                }
            });

            s = document.createElement('script');
            s.async = true;
            s.src = gcsUrl;
            x = document.getElementsByTagName('script')[0];
            fastdom.write(() => {
                x.parentNode.insertBefore(s, x);
            });
        }
    };

    this.init = () => {};
};

export default Search;
