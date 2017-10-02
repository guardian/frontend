// @flow

import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';

import $ from 'lib/$';
import fastdom from 'lib/fastdom-promise';
import fetchJSON from 'lib/fetch-json';
import { isBreakpoint, pageVisible, initPageVisibility } from 'lib/detect';
import mediator from 'lib/mediator';
import { enhanceTweets } from 'common/modules/article/twitter';
import { Sticky } from 'common/modules/ui/sticky';
import { scrollToElement } from 'lib/scroller';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { initNotificationCounter } from 'common/modules/ui/notification-counter';
import { checkElemsForVideos } from 'common/modules/atoms/youtube';

type autoUpdateOptions = {
    toastOffsetTop: number,
    minUpdateDelay: number,
    maxUpdateDelay: number,
    backoffMultiplier: number,
};

const autoUpdate = (opts?: autoUpdateOptions): void => {
    const options = Object.assign(
        {
            toastOffsetTop: 12,
            minUpdateDelay: (isBreakpoint({ min: 'desktop' }) ? 10 : 30) * 1000,
            maxUpdateDelay: 20 * 60 * 1000, // 20 mins
            backoffMultiplier: 0.75, // increase or decrease the back off rate by modifying this
        },
        opts
    );

    // Cache selectors
    const $liveblogBody = $('.js-liveblog-body');
    const $toastButton = $('.toast__button');
    const $toastText = $('.toast__text', $toastButton);
    const toastContainer = qwery('.toast__container')[0];
    let currentUpdateDelay = options.minUpdateDelay;
    let latestBlockId = $liveblogBody.data('most-recent-block');
    let unreadBlocksNo = 0;
    let updateTimeoutId;

    const updateDelay = (delay: number): void => {
        let newDelay;

        if (pageVisible()) {
            newDelay = options.minUpdateDelay;
        } else {
            newDelay = Math.min(delay * 1.5, options.maxUpdateDelay);
        }

        currentUpdateDelay = newDelay;
    };

    const scrolledPastTopBlock = (): boolean =>
        $liveblogBody.offset().top < window.pageYOffset;

    const isLivePage = !window.location.search.includes('?page=');

    const revealInjectedElements = (): void => {
        fastdom.write(() => {
            $('.autoupdate--hidden', $liveblogBody)
                .addClass('autoupdate--highlight')
                .removeClass('autoupdate--hidden');
            mediator.emit('modules:autoupdate:unread', 0);
        });
    };

    const toastButtonRefresh = (): void => {
        fastdom.write(() => {
            if (unreadBlocksNo > 0) {
                const updateText =
                    unreadBlocksNo > 1 ? ' new updates' : ' new update';
                $toastButton.removeClass('toast__button--closed');
                $(toastContainer).addClass('toast__container--open');
                $toastText.html(unreadBlocksNo + updateText);
            } else {
                $toastButton
                    .removeClass('loading')
                    .addClass('toast__button--closed');
                $(toastContainer).removeClass('toast__container--open');
            }
        });
    };

    const injectNewBlocks = (newBlocks: string): void => {
        // Clean up blocks before insertion
        const resultHtml = $.create(`<div>${newBlocks}</div>`)[0];
        let elementsToAdd;

        fastdom.write(() => {
            bonzo(resultHtml.children).addClass('autoupdate--hidden');
            elementsToAdd = [...resultHtml.children];

            // Insert new blocks
            $liveblogBody.prepend(elementsToAdd);

            mediator.emit('modules:autoupdate:updates', elementsToAdd.length);

            initRelativeDates();
            enhanceTweets();
            checkElemsForVideos(elementsToAdd);
        });
    };

    const displayNewBlocks = (): void => {
        if (pageVisible()) {
            revealInjectedElements();
        }

        unreadBlocksNo = 0;
        toastButtonRefresh();
    };

    const checkForUpdates = (): Promise<void> => {
        if (updateTimeoutId !== undefined) {
            clearTimeout(updateTimeoutId);
        }

        let count = 0;
        const shouldFetchBlocks = `&isLivePage=${isLivePage
            ? 'true'
            : 'false'}`;
        const latestBlockIdToUse = latestBlockId || 'block-0';
        const params = `?lastUpdate=${latestBlockIdToUse}${shouldFetchBlocks}`;
        const endpoint = `${window.location.pathname}.json${params}`;

        // #? One day this should be in Promise.finally()
        const setUpdateDelay = (): void => {
            if (count === 0 || currentUpdateDelay > 0) {
                updateDelay(currentUpdateDelay);

                updateTimeoutId = setTimeout(
                    checkForUpdates,
                    currentUpdateDelay
                );
            } else {
                // might have been cached so check straight away
                updateTimeoutId = setTimeout(checkForUpdates, 1);
            }
        };

        return fetchJSON(endpoint, {
            mode: 'cors',
        })
            .then(resp => {
                count = resp.numNewBlocks;

                if (count > 0) {
                    unreadBlocksNo += count;

                    // updates notification bar with number of unread blocks
                    mediator.emit('modules:autoupdate:unread', unreadBlocksNo);

                    latestBlockId = resp.mostRecentBlockId;

                    if (isLivePage) {
                        injectNewBlocks(resp.html);

                        if (scrolledPastTopBlock()) {
                            toastButtonRefresh();
                        } else {
                            displayNewBlocks();
                        }
                    } else {
                        toastButtonRefresh();
                    }
                }

                setUpdateDelay();
            })
            .catch(() => {
                setUpdateDelay();
            });
    };

    const setUpListeners = (): void => {
        bean.on(document.body, 'click', '.toast__button', () => {
            if (isLivePage) {
                fastdom.read(() => {
                    scrollToElement(qwery('.blocks')[0], 300, 'easeOutQuad');

                    fastdom
                        .write(() => {
                            $toastButton.addClass('loading');
                        })
                        .then(() => {
                            displayNewBlocks();
                        });
                });
            } else {
                location.assign(window.location.pathname);
            }
        });

        mediator.on('modules:toast__tofix:unfixed', () => {
            if (isLivePage && unreadBlocksNo > 0) {
                fastdom
                    .write(() => {
                        $toastButton.addClass('loading');
                    })
                    .then(() => {
                        displayNewBlocks();
                    });
            }
        });

        mediator.on('modules:detect:pagevisibility:visible', () => {
            if (unreadBlocksNo === 0) {
                revealInjectedElements();
            }

            currentUpdateDelay = 0; // means please get us fully up to date
            checkForUpdates();
        });
    };

    // init
    initNotificationCounter();

    new Sticky(toastContainer, {
        top: options.toastOffsetTop,
        emitMessage: true,
        containInParent: false,
    }).init();

    checkForUpdates();
    initPageVisibility();
    setUpListeners();

    fastdom.write(() => {
        // Enables the animations for injected blocks
        $liveblogBody.addClass('autoupdate--has-animation');
    });
};

export { autoUpdate };
