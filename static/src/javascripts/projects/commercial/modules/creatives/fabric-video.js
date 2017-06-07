// @flow
import qwery from 'qwery';
import { addEventListener } from 'lib/events';
import fastdom from 'lib/fastdom-promise';
import detect from 'lib/detect';
import template from 'lodash/utilities/template';
import {
    addTrackingPixel,
} from 'commercial/modules/creatives/add-tracking-pixel';
import addViewabilityTracker
    from 'commercial/modules/creatives/add-viewability-tracker';
import fabricVideoStr
    from 'raw-loader!commercial/views/creatives/fabric-video.html';

class FabricVideo {
    isUpdating: boolean;
    adSlot: HTMLElement;
    params: Object;
    layer2: ?Array<Element>;
    video: ?HTMLVideoElement;
    hasVideo: boolean;
    inView: boolean;

    constructor(adSlot: HTMLElement, params: Object) {
        const isSmallScreen = detect.isBreakpoint({
            max: 'phablet',
        });

        this.isUpdating = false;
        this.hasVideo = !(detect.isIOS() ||
            detect.isAndroid() ||
            isSmallScreen);
        this.inView = false;
        this.adSlot = adSlot;
        this.params = params;

        this.params.id = `fabric-video-${Math.floor(Math.random() * 10000).toString(16)}`;

        if (isSmallScreen) {
            this.params.posterMobile = `<div class="creative__poster" style="background-image:url(${this.params.Videobackupimage})"></div>`;
        } else {
            if (this.hasVideo) {
                this.params.video = `<video muted class="creative__video creative__video--${this.params.Videoalignment}"><source src="${this.params.VideoURL}" type="video/mp4"></video>`;
            }

            this.params.posterTablet = `<div class="creative__poster" style="background-image:url(${this.params.BackgroundImagemobile})"></div>`;
        }
    }

    onVideoEnded() {
        if (this.video) {
            this.video.onended = null;
            this.video = null;
        }
    }

    onScroll() {
        const viewportHeight = detect.getViewport().height;
        const rect = this.adSlot.getBoundingClientRect();
        this.inView = rect.top >= 0 && rect.bottom < viewportHeight;
        if (!this.isUpdating) {
            this.isUpdating = true;
            fastdom.write(this.updateView);
        }
    }

    updateView() {
        this.isUpdating = false;
        if (this.video) {
            this.updateVideo();
        }
        this.updateAnimation();
    }

    updateVideo() {
        if (this.video) {
            if (this.inView) {
                this.video.play();
            } else {
                this.video.pause();
            }
        }
    }

    updateAnimation() {
        if (this.inView) {
            this.playAnimation();
        } else {
            this.pauseAnimation();
        }
    }

    playAnimation() {
        if (this.layer2) {
            this.layer2.forEach(l => {
                l.classList.add('is-animating');
            });
        }
    }

    pauseAnimation() {
        if (this.layer2) {
            this.layer2.forEach(l => {
                l.classList.remove('is-animating');
            });
        }
    }

    create() {
        const fabricVideoTpl = template(fabricVideoStr);

        return fastdom
            .write(() => {
                if (this.params.Trackingpixel) {
                    addTrackingPixel(
                        this.params.Trackingpixel + this.params.cacheBuster
                    );
                }
                if (this.params.Researchpixel) {
                    addTrackingPixel(
                        this.params.Researchpixel + this.params.cacheBuster
                    );
                }

                this.adSlot.insertAdjacentHTML(
                    'beforeend',
                    fabricVideoTpl({
                        data: this.params,
                    })
                );

                if (this.params.viewabilityTracker) {
                    addViewabilityTracker(
                        this.adSlot,
                        this.params.id,
                        this.params.viewabilityTracker
                    );
                }
                if (this.adSlot) {
                    this.adSlot.classList.add('ad-slot--fabric');
                }

                if (
                    this.adSlot.parentNode &&
                    this.adSlot.parentNode instanceof Element &&
                    this.adSlot.parentNode.classList.contains(
                        'top-banner-ad-container'
                    )
                ) {
                    this.adSlot.parentNode.classList.add(
                        'top-banner-ad-container--fabric'
                    );
                }
            })
            .then(() => {
                this.layer2 = qwery('.creative__layer2', this.adSlot);

                addEventListener(window, 'scroll', this.onScroll, {
                    passive: true,
                });
                addEventListener(this.adSlot, 'animationend', () => {
                    window.removeEventListener('scroll', this.onScroll);
                });

                if (this.hasVideo) {
                    this.video = this.adSlot.getElementsByTagName('video')[0];
                    this.video.onended = this.onVideoEnded;
                }

                fastdom.read(this.onScroll);

                return true;
            });
    }
}

export { FabricVideo };
