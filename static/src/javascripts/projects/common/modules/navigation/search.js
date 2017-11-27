// @flow

import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import config from 'lib/config';

const focusSearchField = (): void => {
    const $input = $('input.gsc-input');
    if ($input.length > 0) {
        $input.focus();
    }
};

// TODO refactor to singleton
class Search {
    gcsUrl: string;
    resultSetSize: number;

    constructor(): void {
        fastdom
            .read(() => [
                ...document.getElementsByClassName('js-search-toggle'),
            ])
            .then(toggles => {
                const googleSearchSwitch = config.get('switches.googleSearch');
                const googleSearchUrl = config.get('page.googleSearchUrl');
                const googleSearchId = config.get('page.googleSearchId');

                if (
                    googleSearchSwitch &&
                    googleSearchUrl &&
                    googleSearchId &&
                    toggles.length > 0
                ) {
                    this.gcsUrl = `${googleSearchUrl}?cx=${googleSearchId}`;
                    this.resultSetSize =
                        config.get('page.section') === 'identity' ? 3 : 10;

                    toggles.forEach(toggle => {
                        const popupClass = toggle.getAttribute('data-toggle');

                        if (!popupClass) {
                            return;
                        }

                        fastdom
                            .read(
                                () =>
                                    document.getElementsByClassName(
                                        popupClass
                                    )[0]
                            )
                            .then(popup => {
                                if (!popup) {
                                    return;
                                }

                                bean.on(toggle, 'click', e => {
                                    const maybeDismissSearchPopup = event => {
                                        let el = event.target;
                                        let clickedPop = false;

                                        while (el && !clickedPop) {
                                            /* either the search pop-up or the autocomplete resultSetSize
                                           NOTE: it would be better to check for `.gssb_c`,
                                                 which is the outer autocomplete element, but
                                                 google stops the event bubbling earlier
                                        */
                                            if (
                                                el &&
                                                el.classList &&
                                                (el.classList.contains(
                                                    popupClass
                                                ) ||
                                                    el.classList.contains(
                                                        'gsq_a'
                                                    ))
                                            ) {
                                                clickedPop = true;
                                            }

                                            el = el.parentNode;
                                        }

                                        if (!clickedPop) {
                                            event.preventDefault();
                                            toggle.classList.remove(
                                                'is-active'
                                            );
                                            popup.classList.add('is-off');

                                            bean.off(
                                                document,
                                                'click',
                                                maybeDismissSearchPopup
                                            );
                                        }
                                    };

                                    setTimeout(() => {
                                        if (
                                            toggle.classList.contains(
                                                'is-active'
                                            )
                                        ) {
                                            bean.on(
                                                document,
                                                'click',
                                                maybeDismissSearchPopup
                                            );
                                        }
                                    });

                                    this.load(popup);

                                    // Make sure search is always in the correct state
                                    focusSearchField();
                                    e.preventDefault();
                                });
                            });
                    });
                }
            });
    }

    load(popup: HTMLElement): void {
        let s;
        let x;

        fastdom
            .read(() => ({
                allSearchPlaceholders: [
                    ...document.getElementsByClassName('js-search-placeholder'),
                ],
                searchPlaceholder: popup.getElementsByClassName(
                    'js-search-placeholder'
                )[0],
            }))
            .then(els => {
                const { allSearchPlaceholders, searchPlaceholder } = els;

                // Set so Google know what to do
                // eslint-disable-next-line no-underscore-dangle
                window.__gcse = {
                    callback: focusSearchField,
                };

                if (!searchPlaceholder) {
                    return;
                }

                // Unload any search placeholders elsewhere in the DOM
                allSearchPlaceholders.forEach(c => {
                    if (c !== searchPlaceholder) {
                        fastdom.write(() => {
                            c.innerHTML = '';
                        });
                    }
                });

                // Load the Google search monolith, if not already present in this context.
                // We have to re-run their script each time we do this.
                if (!searchPlaceholder.innerHTML) {
                    fastdom.write(() => {
                        if (searchPlaceholder) {
                            searchPlaceholder.innerHTML = `<div class="search-box" role="search">
                            <gcse:searchbox></gcse:searchbox>
                            </div>
                            <div class="search-results" data-link-name="search">
                            <gcse:searchresults webSearchResultSetSize="'}${
                                this.resultSetSize
                            }" linkTarget="_self"></gcse:searchresults>
                            </div>`;
                        }
                    });

                    bean.on(searchPlaceholder, 'keydown', '.gsc-input', () => {
                        fastdom.read(() => {
                            const $autoCompleteObject = $('.gssb_c');
                            const searchFromTop = $autoCompleteObject.css(
                                'top'
                            );
                            const windowOffset = $(window).scrollTop();

                            fastdom.write(() => {
                                $autoCompleteObject.css({
                                    top:
                                        parseInt(searchFromTop, 10) +
                                        windowOffset,
                                    'z-index': '1030',
                                });
                            });
                        });
                    });

                    bean.on(
                        searchPlaceholder,
                        'click',
                        '.search-results',
                        e => {
                            const targetEl = e.target;

                            if (targetEl.nodeName.toLowerCase() === 'a') {
                                targetEl.target = '_self';
                            }
                        }
                    );

                    s = document.createElement('script');
                    s.async = true;
                    s.src = this.gcsUrl;
                    x = document.getElementsByTagName('script')[0];

                    fastdom.write(() => {
                        if (x.parentNode) {
                            x.parentNode.insertBefore(s, x);
                        }
                    });
                }
            });
    }
}

export { Search };
