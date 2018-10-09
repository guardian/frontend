// @flow
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import { getViewport, isBreakpoint, isIOS, isAndroid } from 'lib/detect';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import template from 'lodash/template';
import fabricExpandingV1Html from 'raw-loader!commercial/views/creatives/fabric-expanding-v1.html';
import fabricExpandingVideoHtml from 'raw-loader!commercial/views/creatives/fabric-expanding-video.html';
import arrowDown from 'svgs/icon/arrow-down.svg';
import closeCentral from 'svgs/icon/close-central.svg';
import bindAll from 'lodash/bindAll';
import { addTrackingPixel } from 'commercial/modules/creatives/add-tracking-pixel';
import { addViewabilityTracker } from 'commercial/modules/creatives/add-viewability-tracker';

// Forked from expandable-v3.js
class FabricExpandingV1 {
    adSlot: any;
    params: any;
    isClosed: any;
    initialExpandCounter: any;
    closedHeight: any;
    openedHeight: any;

    $button: any;
    $ad: any;

    static hasScrollEnabled: boolean;

    constructor(adSlot: any, params: any) {
        this.adSlot = adSlot;
        this.params = params;
        this.isClosed = true;
        this.initialExpandCounter = false;

        this.closedHeight = 250;
        this.openedHeight = 500;

        bindAll(this, 'updateBgPosition', 'listener');
    }

    updateBgPosition() {
        const viewportHeight = getViewport().height;
        const adSlotTop = this.adSlot.getBoundingClientRect().top;

        const adHeight = this.isClosed ? this.closedHeight : this.openedHeight;
        const inViewB = viewportHeight > adSlotTop;
        const inViewT = -adHeight * 2 < adSlotTop + 20;
        const topCusp =
            inViewT && viewportHeight * 0.4 - adHeight > adSlotTop
                ? 'true'
                : 'false';
        const bottomCusp =
            inViewB && viewportHeight * 0.5 < adSlotTop ? 'true' : 'false';
        const bottomScroll =
            bottomCusp === 'true'
                ? 50 - (viewportHeight * 0.5 - adSlotTop) * -0.2
                : 50;
        const topScroll =
            topCusp === 'true'
                ? (viewportHeight * 0.4 - adSlotTop - adHeight) * 0.2
                : 0;

        let scrollAmount;

        switch (this.params.backgroundImagePType) {
            case 'split':
                scrollAmount = bottomScroll + topScroll;
                fastdom.write(() => {
                    $('.ad-exp--expand-scrolling-bg', this.adSlot).css({
                        'background-repeat': 'no-repeat',
                        'background-position': `50%${scrollAmount}%`,
                    });
                });
                break;
            case 'fixed':
                scrollAmount = -adSlotTop;
                fastdom.write(() => {
                    $('.ad-exp--expand-scrolling-bg', this.adSlot).css(
                        'background-position',
                        `50%${scrollAmount}px`
                    );
                });
                break;
            case 'fixed matching fluid250':
                fastdom.write(() => {
                    $('.ad-exp--expand-scrolling-bg', this.adSlot).addClass(
                        'ad-exp--expand-scrolling-bg-fixed'
                    );
                });
                break;
            case 'parallax':
                scrollAmount = Math.ceil(adSlotTop * 0.3) + 20;
                fastdom.write(() => {
                    $('.ad-exp--expand-scrolling-bg', this.adSlot).addClass(
                        'ad-exp--expand-scrolling-bg-parallax'
                    );
                    $('.ad-exp--expand-scrolling-bg', this.adSlot).css(
                        'background-position',
                        `50%${scrollAmount}%`
                    );
                });
                break;
            case 'none':
                break;
            default:
                break;
        }
    }

    listener() {
        if (
            !this.initialExpandCounter &&
            getViewport().height >
                this.adSlot.getBoundingClientRect().top + this.openedHeight
        ) {
            const itemId = $('.ad-slot__content', this.adSlot).attr('id');
            const itemIdArray = itemId.split('/');

            if (!local.get(`gu.commercial.expandable.${itemIdArray[1]}`)) {
                // expires in 1 week
                const week = 1000 * 60 * 60 * 24 * 7;
                fastdom.write(() => {
                    local.set(
                        `gu.commercial.expandable.${itemIdArray[1]}`,
                        true,
                        {
                            expires: Date.now() + week,
                        }
                    );
                    this.$button.addClass('button-spin');
                    $('.ad-exp__open-chevron')
                        .removeClass('chevron-up')
                        .addClass('chevron-down');
                    this.$ad.css('height', this.openedHeight);
                    this.isClosed = false;
                    this.initialExpandCounter = true;
                });
            } else if (this.isClosed) {
                fastdom.write(() => {
                    $('.ad-exp__open-chevron').addClass('chevron-up');
                });
            }
            return true;
        }
    }

    buildVideo(customClass: string) {
        const videoAspectRatio = 16 / 9;
        const videoHeight = isBreakpoint({
            max: 'phablet',
        })
            ? 125
            : 250;
        const videoWidth = videoHeight * videoAspectRatio;
        const leftMargin =
            this.params.videoPositionH === 'center'
                ? `margin-left: ${videoWidth / -2}px`
                : '';
        const leftPosition =
            this.params.videoPositionH === 'left'
                ? `left: ${this.params.videoHorizSpace}px`
                : '';
        const rightPosition =
            this.params.videoPositionH === 'right'
                ? `right: ${this.params.videoHorizSpace}px`
                : '';

        const viewModel = {
            width: videoWidth,
            height: videoHeight,
            src: `${
                this.params.videoURL
            }?rel=0&amp;controls=0&amp;showinfo=0&amp;title=0&amp;byline=0&amp;portrait=0`,
            className: [
                'expandable_video',
                `expandable_video--horiz-pos-${this.params.videoPositionH}`,
                customClass,
            ].join(' '),
            inlineStyle: [leftMargin, leftPosition, rightPosition].join('; '),
        };

        return template(fabricExpandingVideoHtml)(viewModel);
    }

    stopVideo(delay: number = 0) {
        const videoSelector = isBreakpoint({
            min: 'tablet',
        })
            ? '.js-fabric-video--desktop'
            : '.js-fabric-video--mobile';
        const video = $(videoSelector, this.adSlot);
        const videoSrc = video.attr('src');

        window.setTimeout(() => {
            video.attr('src', `${videoSrc}&amp;autoplay=0`);
        }, delay);
    }

    create() {
        const hasVideo = this.params.videoURL !== '';
        const videoDesktop = {
            videoDesktop: hasVideo
                ? this.buildVideo('js-fabric-video--desktop')
                : '',
        };
        const videoMobile = {
            videoMobile: hasVideo
                ? this.buildVideo('js-fabric-video--mobile')
                : '',
        };
        const showmoreArrow = {
            showArrow:
                this.params.showMoreType === 'arrow-only' ||
                this.params.showMoreType === 'plus-and-arrow'
                    ? `<button class="ad-exp__open-chevron ad-exp__open">${
                          arrowDown.markup
                      }</button>`
                    : '',
        };
        const showmorePlus = {
            showPlus:
                this.params.showMoreType === 'plus-only' ||
                this.params.showMoreType === 'plus-and-arrow'
                    ? `<button class="ad-exp__close-button ad-exp__open">${
                          closeCentral.markup
                      }</button>`
                    : '',
        };
        const scrollbgDefaultY = '0%'; // used if no parallax / fixed background scroll support
        const scrollingbg = {
            scrollbg:
                this.params.backgroundImagePType !== 'none'
                    ? `<div class="ad-exp--expand-scrolling-bg" style="background-image: url(${
                          this.params.backgroundImageP
                      }); background-position: ${
                          this.params.backgroundImagePPosition
                      } ${scrollbgDefaultY}; background-repeat: ${
                          this.params.backgroundImagePRepeat
                      };"></div>`
                    : '',
        };
        this.params.id = `fabric-expanding-${Math.floor(
            Math.random() * 10000
        ).toString(16)}`;
        const $fabricExpandingV1 = $.create(
            template(fabricExpandingV1Html)({
                data: Object.assign(
                    this.params,
                    showmoreArrow,
                    showmorePlus,
                    videoDesktop,
                    videoMobile,
                    scrollingbg
                ),
            })
        );

        mediator.on('window:throttledScroll', this.listener);

        bean.on(this.adSlot, 'click', '.ad-exp__open', () => {
            if (!this.isClosed && hasVideo) {
                // wait 1000ms for close animation to finish
                this.stopVideo(1000);
            }

            fastdom.write(() => {
                $('.ad-exp__close-button').toggleClass('button-spin');
                $('.ad-exp__open-chevron')
                    .removeClass('chevron-up')
                    .toggleClass('chevron-down');
                this.$ad.css(
                    'height',
                    this.isClosed ? this.openedHeight : this.closedHeight
                );
                this.isClosed = !this.isClosed;
                this.initialExpandCounter = true;
            });
        });

        if (FabricExpandingV1.hasScrollEnabled) {
            // update bg position
            this.updateBgPosition();

            mediator.on('window:throttledScroll', this.updateBgPosition);
            // to be safe, also update on window resize
            mediator.on('window:throttledResize', this.updateBgPosition);
        }

        return fastdom.write(function() {
            this.$ad = $('.ad-exp--expand', $fabricExpandingV1).css(
                'height',
                this.closedHeight
            );
            this.$button = $('.ad-exp__open', $fabricExpandingV1);

            $('.ad-exp-collapse__slide', $fabricExpandingV1).css(
                'height',
                this.closedHeight
            );

            if (this.params.trackingPixel) {
                addTrackingPixel(
                    this.params.trackingPixel + this.params.cacheBuster
                );
            }

            if (this.params.researchPixel) {
                addTrackingPixel(
                    this.params.researchPixel + this.params.cacheBuster
                );
            }

            $fabricExpandingV1.appendTo(this.adSlot);

            if (this.params.viewabilityTracker) {
                addViewabilityTracker(
                    this.adSlot,
                    this.params.id,
                    this.params.viewabilityTracker
                );
            }

            this.adSlot.classList.add('ad-slot--fabric');

            if (
                this.adSlot.parentNode.classList.contains(
                    'top-banner-ad-container'
                )
            ) {
                this.adSlot.parentNode.classList.add(
                    'top-banner-ad-container--fabric'
                );
            }
            return true;
        }, this);
    }
}

FabricExpandingV1.hasScrollEnabled = !isIOS() && !isAndroid();

export { FabricExpandingV1 };
