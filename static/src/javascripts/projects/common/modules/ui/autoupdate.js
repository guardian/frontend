/*
    Description: Used to load update fragments of the DOM from specfied endpoint
*/

import fastdom from 'common/utils/fastdom-promise';
import bean from 'bean';
import bonzo from 'bonzo';
import qwery from 'qwery';
import $ from 'common/utils/$';
import ajax from 'common/utils/ajax';
import detect from 'common/utils/detect';
import mediator from 'common/utils/mediator';
import twitter from 'common/modules/article/twitter';
import Sticky from 'common/modules/ui/sticky';
import scroller from 'common/utils/scroller';
import RelativeDates from 'common/modules/ui/relativedates';
import NotificationCounter from 'common/modules/ui/notification-counter';
import youtube from 'common/modules/atoms/youtube';

export default function(opts) {
    const isMinDesktop = detect.isBreakpoint({
        min: 'desktop',
    });
    // 10 or 30 seconds minimum, depending on breakpoint
    const minUpdateDelay = (isMinDesktop ? 10 : 30) * 1000;
    const options = Object.assign(
        {
            toastOffsetTop: 12, // pixels from the top
            minUpdateDelay,
            maxUpdateDelay: 20 * 60 * 1000, // 20 mins
            backoffMultiplier: 0.75, // increase or decrease the back off rate by modifying this
        },
        opts
    );

    // Cache selectors
    const $liveblogBody = $('.js-liveblog-body');
    const $toastButton = $('.toast__button');
    const $toastText = $('.toast__text', this.$toastButton);
    const toastContainer = qwery('.toast__container')[0];
    const isLivePage = window.location.search.indexOf('?page=') === -1;
    let currentUpdateDelay = options.minUpdateDelay;
    let latestBlockId = $liveblogBody.data('most-recent-block');
    let unreadBlocksNo = 0;
    let updateTimeoutId;

    function updateDelay(delay) {
        let newDelay;

        if (detect.pageVisible()) {
            newDelay = options.minUpdateDelay;
        } else {
            newDelay = Math.min(delay * 1.5, options.maxUpdateDelay);
        }

        currentUpdateDelay = newDelay;
    }

    function scrolledPastTopBlock() {
        return $liveblogBody.offset().top < window.pageYOffset;
    }

    function revealInjectedElements() {
        fastdom.write(() => {
            $('.autoupdate--hidden', $liveblogBody)
                .addClass('autoupdate--highlight')
                .removeClass('autoupdate--hidden');
            mediator.emit('modules:autoupdate:unread', 0);
        });
    }

    function toastButtonRefresh() {
        const containerOpenClass = 'toast__container--open';
        const containerClosedClass = 'toast__button--closed';

        fastdom.write(() => {
            if (unreadBlocksNo > 0) {
                const updateText = unreadBlocksNo > 1
                    ? 'new updates'
                    : 'new update';
                $toastButton.removeClass(containerClosedClass);
                $(toastContainer).addClass(containerOpenClass);
                $toastText.html(`${unreadBlocksNo} ${updateText}`);
            } else {
                $toastButton
                    .removeClass('loading')
                    .addClass(containerClosedClass);
                $(toastContainer).removeClass(containerOpenClass);
            }
        });
    }

    function injectNewBlocks(newBlocks) {
        // Clean up blocks before insertion
        const resultHtml = $.create(`<div>${newBlocks}</div>`)[0];
        let elementsToAdd;

        fastdom.write(() => {
            bonzo(resultHtml.children).addClass('autoupdate--hidden');
            elementsToAdd = Array.from(resultHtml.children);

            // Insert new blocks
            $liveblogBody.prepend(elementsToAdd);

            mediator.emit('modules:autoupdate:updates', elementsToAdd.length);

            RelativeDates.init();
            twitter.enhanceTweets();
            youtube.checkElemsForVideos(elementsToAdd);
        });
    }

    function displayNewBlocks() {
        if (detect.pageVisible()) {
            revealInjectedElements();
        }

        unreadBlocksNo = 0;
        toastButtonRefresh();
    }

    function checkForUpdates() {
        if (updateTimeoutId !== undefined) {
            clearTimeout(updateTimeoutId);
        }

        const shouldFetchBlocks = `&isLivePage=${isLivePage ? 'true' : 'false'}`;
        const latestBlockIdToUse = latestBlockId || 'block-0';
        const pathName = window.location.pathname;
        const url = `${pathName}.json?lastUpdate=${latestBlockIdToUse}${shouldFetchBlocks}`;
        let count = 0;

        return ajax({
            url,
            type: 'json',
            method: 'get',
            crossOrigin: true,
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
            })
            .always(() => {
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
            });
    }

    function setUpListeners() {
        bean.on(document.body, 'click', '.toast__button', () => {
            if (isLivePage) {
                fastdom.read(() => {
                    scroller.scrollToElement(
                        qwery('.blocks')[0],
                        300,
                        'easeOutQuad'
                    );

                    fastdom
                        .write(() => {
                            $toastButton.addClass('loading');
                        })
                        .then(displayNewBlocks);
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
    }

    /*
        Init
    */

    new NotificationCounter().init();
    new Sticky(toastContainer, {
        top: options.toastOffsetTop,
        emitMessage: true,
        containInParent: false,
    }).init();

    checkForUpdates();
    detect.initPageVisibility();
    setUpListeners();

    fastdom.write(() => {
        // Enables the animations for injected blocks
        $liveblogBody.addClass('autoupdate--has-animation');
    });
}
