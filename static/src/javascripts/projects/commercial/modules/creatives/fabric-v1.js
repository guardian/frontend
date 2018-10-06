// @flow
import fastdom from 'lib/fastdom-promise';
import { isEnhanced, isAndroid, getUserAgent, getViewport } from 'lib/detect';
import template from 'lodash/template';
import mediator from 'lib/mediator';
import { addTrackingPixel } from 'commercial/modules/creatives/add-tracking-pixel';
import { addViewabilityTracker } from 'commercial/modules/creatives/add-viewability-tracker';
import fabricV1Html from 'raw-loader!commercial/views/creatives/fabric-v1.html';
import iframeVideoStr from 'raw-loader!commercial/views/creatives/iframe-video.html';
import scrollBgStr from 'raw-loader!commercial/views/creatives/scrollbg.html';

const hasBackgroundFixedSupport = !isAndroid();
const isIE10OrLess =
    typeof getUserAgent === 'object' &&
    getUserAgent.browser === 'MSIE' &&
    parseInt(getUserAgent.version, 10) <= 10;

let fabricV1Tpl;
let iframeVideoTpl;
let scrollBgTpl;

// This is a hasty clone of fluid250.js

class FabricV1 {
    adSlot: Element;
    params: Object;

    scrollingBg: ?HTMLElement;
    layer2: ?HTMLElement;
    scrollType: string;

    constructor(adSlot: Element, params: Object) {
        this.adSlot = adSlot;
        this.params = params;
    }

    create() {
        if (!fabricV1Tpl) {
            fabricV1Tpl = template(fabricV1Html);
            iframeVideoTpl = template(iframeVideoStr);
            scrollBgTpl = template(scrollBgStr);
        }

        const videoPosition = {
            position:
                this.params.videoPositionH === 'left' ||
                this.params.videoPositionH === 'right'
                    ? `${this.params.videoPositionH}:${
                          this.params.videoHorizSpace
                      }px;`
                    : '',
        };

        const templateOptions = {
            id: `fabric-${Math.trunc(Math.random() * 10000).toString(16)}`,
            showLabel: this.params.showAdLabel !== 'hide',
            video: this.params.videoURL
                ? iframeVideoTpl(Object.assign({}, this.params, videoPosition))
                : '',
            hasContainer: 'layerTwoAnimation' in this.params,
            layerTwoBGPosition:
                this.params.layerTwoBGPosition &&
                (!this.params.layerTwoAnimation ||
                    this.params.layerTwoAnimation === 'disabled' ||
                    (!isEnhanced() &&
                        this.params.layerTwoAnimation === 'enabled'))
                    ? this.params.layerTwoBGPosition
                    : '0% 0%',
            scrollbg:
                this.params.backgroundImagePType &&
                this.params.backgroundImagePType !== 'none'
                    ? scrollBgTpl(this.params)
                    : false,
        };

        if (templateOptions.scrollbg) {
            // update bg position
            fastdom.read(this.updateBgPosition, this);
            mediator.on(
                'window:throttledScroll',
                this.updateBgPosition.bind(this)
            );
            // to be safe, also update on window resize
            mediator.on(
                'window:throttledResize',
                this.updateBgPosition.bind(this)
            );
        }

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

        return fastdom.write(() => {
            this.adSlot.insertAdjacentHTML(
                'beforeend',
                fabricV1Tpl({
                    data: Object.assign({}, this.params, templateOptions),
                })
            );
            this.scrollingBg = this.adSlot.querySelector('.ad-scrolling-bg');
            this.layer2 = this.adSlot.querySelector(
                '.hide-until-tablet .fabric-v1_layer2'
            );
            this.scrollType = this.params.backgroundImagePType;

            // layer two animations must not have a background position, otherwise the background will
            // be visible before the animation has been initiated.
            if (
                this.params.layerTwoAnimation === 'enabled' &&
                this.layer2 &&
                isEnhanced() &&
                !isIE10OrLess
            ) {
                this.layer2.style.backgroundPosition = '';
            }

            if (
                this.scrollType === 'fixed' &&
                this.scrollingBg &&
                hasBackgroundFixedSupport
            ) {
                this.scrollingBg.style.backgroundAttachment = 'fixed';
            }

            // #? `classList.add` takes multiple arguments, but we are using it
            // here with arity 1 because polyfill.io has incorrect support with IE 10 and 11.
            // One may revert to this.adSlot.classList.add('ad-slot--fabric-v1', 'ad-slot--fabric', 'content__mobile-full-width');
            // When support is correct or when we stop supporting IE <= 11
            this.adSlot.classList.add('ad-slot--fabric-v1');
            this.adSlot.classList.add('ad-slot--fabric');
            this.adSlot.classList.add('content__mobile-full-width');

            if (
                this.adSlot.parentNode &&
                this.adSlot.parentNode instanceof HTMLElement &&
                this.adSlot.parentNode.classList.contains(
                    'top-banner-ad-container'
                )
            ) {
                this.adSlot.parentNode.classList.add(
                    'top-banner-ad-container--fabric'
                );
            }

            if (this.params.viewabilityTracker) {
                addViewabilityTracker(
                    this.adSlot,
                    this.params.id,
                    this.params.viewabilityTracker
                );
            }

            return true;
        });
    }

    updateBgPosition() {
        if (this.scrollType === 'parallax') {
            const scrollAmount =
                Math.ceil(this.adSlot.getBoundingClientRect().top * 0.3) + 20;
            fastdom.write(() => {
                if (this.scrollingBg) {
                    this.scrollingBg.style.backgroundPosition = `50% ${scrollAmount}%`;
                    this.scrollingBg.classList.add('ad-scrolling-bg-parallax');
                }
            });
        } else if (this.scrollType === 'fixed' && !hasBackgroundFixedSupport) {
            const adRect = this.adSlot.getBoundingClientRect();
            const vPos =
                ((window.innerHeight - adRect.bottom + adRect.height / 2) /
                    window.innerHeight) *
                100;
            fastdom.write(() => {
                if (this.scrollingBg) {
                    this.scrollingBg.style.backgroundPosition = `50% ${vPos}%`;
                }
            });
        }
        this.layer2Animation();
    }

    layer2Animation() {
        let inViewB;
        if (
            this.params.layerTwoAnimation === 'enabled' &&
            isEnhanced() &&
            !isIE10OrLess
        ) {
            inViewB =
                getViewport().height > this.adSlot.getBoundingClientRect().top;
            fastdom.write(() => {
                if (this.layer2) {
                    this.layer2.classList.add(
                        `ad-scrolling-text-hide${
                            this.params.layerTwoAnimationPosition
                                ? `-${this.params.layerTwoAnimationPosition}`
                                : ''
                        }`
                    );
                }
                if (this.layer2 && inViewB) {
                    this.layer2.classList.add(
                        `ad-scrolling-text-animate${
                            this.params.layerTwoAnimationPosition
                                ? `-${this.params.layerTwoAnimationPosition}`
                                : ''
                        }`
                    );
                }
            });
        }
    }
}

export { FabricV1 };
