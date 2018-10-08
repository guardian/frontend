// @flow
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import template from 'lodash/template';
import fabricExpandableVideoHtml from 'raw-loader!commercial/views/creatives/fabric-expandable-video-v2.html';
import fabricExpandableCtaHtml from 'raw-loader!commercial/views/creatives/fabric-expandable-video-v2-cta.html';
import arrowDown from 'svgs/icon/arrow-down.svg';
import closeCentral from 'svgs/icon/close-central.svg';
import { addTrackingPixel } from 'commercial/modules/creatives/add-tracking-pixel';
import { addViewabilityTracker } from 'commercial/modules/creatives/add-viewability-tracker';

const FabricExpandableVideoV2 = (adSlot: Element, params: Object) => {
    let isClosed = true;
    const closedHeight = 250;
    const openedHeight = 500;

    const ctaTpl = template(fabricExpandableCtaHtml);

    const create = () => {
        const videoHeight = openedHeight;
        const plusIconPosition = params.showCrossInContainer.substring(3);
        const additionalParams = {
            id: `fabric-expandable-${Math.round(Math.random() * 10000).toString(
                16
            )}`,
            desktopCTA: params.ctaDesktopImage
                ? ctaTpl({
                      media: 'hide-until-tablet',
                      link: params.link,
                      image: params.ctaDesktopImage,
                      position: params.ctaDesktopPosition,
                  })
                : '',
            mobileCTA: params.ctaMobileImage
                ? ctaTpl({
                      media: 'mobile-only',
                      link: params.link,
                      image: params.ctaMobileImage,
                      position: params.ctaMobilePosition,
                  })
                : '',
            showArrow:
                params.showMoreType === 'arrow-only' ||
                params.showMoreType === 'plus-and-arrow'
                    ? `<button class="ad-exp__open-chevron ad-exp__open">${
                          arrowDown.markup
                      }</button>`
                    : '',
            showPlus:
                params.showMoreType === 'plus-only' ||
                params.showMoreType === 'plus-and-arrow'
                    ? `<button class="ad-exp__close-button ad-exp__open ad-exp__open--${plusIconPosition}">${
                          closeCentral.markup
                      }</button>`
                    : '',
            videoEmbed:
                params.YoutubeVideoURL !== ''
                    ? `<iframe id="YTPlayer" width="100%" height="${videoHeight}" src="${
                          params.YoutubeVideoURL
                      }?showinfo=0&amp;rel=0&amp;controls=0&amp;fs=0&amp;title=0&amp;byline=0&amp;portrait=0" frameborder="0" class="expandable-video"></iframe>`
                    : '',
        };

        const $fabricExpandableVideo = $.create(
            template(fabricExpandableVideoHtml)({
                data: Object.assign(params, additionalParams),
            })
        );
        const $ad = $('.ad-exp--expand', $fabricExpandableVideo);

        const open = isOpen => {
            const videoSrc = $('#YTPlayer').attr('src');
            let videoSrcAutoplay = videoSrc;

            if (videoSrc.indexOf('autoplay') === -1) {
                videoSrcAutoplay = `${videoSrc}&amp;autoplay=1`;
            } else {
                videoSrcAutoplay = videoSrcAutoplay.replace(
                    isOpen ? 'autoplay=0' : 'autoplay=1',
                    isOpen ? 'autoplay=1' : 'autoplay=0'
                );
            }

            if (isOpen) {
                $('.ad-exp__close-button', adSlot).addClass('button-spin');
                $('.ad-exp__open-chevron', adSlot).addClass('chevron-down');
                $ad.css('height', openedHeight);
                $fabricExpandableVideo.addClass('creative--open');
                $('.slide-video, .slide-video .ad-exp__layer', adSlot)
                    .css('height', openedHeight)
                    .addClass('slide-video__expand');
            } else {
                $('.ad-exp__close-button', adSlot).removeClass('button-spin');
                $('.ad-exp__open-chevron', adSlot).removeClass('chevron-down');
                $ad.css('height', closedHeight);
                $fabricExpandableVideo.removeClass('creative--open');
                $('.slide-video, .slide-video .ad-exp__layer', adSlot)
                    .css('height', closedHeight)
                    .removeClass('slide-video__expand');
            }

            isClosed = !isOpen;

            setTimeout(() => {
                $('#YTPlayer').attr('src', videoSrcAutoplay);
            }, 1000);
        };

        bean.on(adSlot, 'click', '.ad-exp__open', () => {
            fastdom.write(() => {
                open(isClosed);
            });
        });

        bean.on(
            adSlot,
            'click',
            '.video-container__cta, .creative__cta',
            () => {
                fastdom.write(() => {
                    open(false);
                });
            }
        );

        return fastdom.write(() => {
            $ad.css('height', closedHeight);
            $('.ad-exp-collapse__slide', $fabricExpandableVideo).css(
                'height',
                closedHeight
            );
            if (params.trackingPixel) {
                addTrackingPixel(params.trackingPixel + params.cacheBuster);
            }
            if (params.researchPixel) {
                addTrackingPixel(params.researchPixel + params.cacheBuster);
            }
            $fabricExpandableVideo.appendTo(adSlot);
            if (params.viewabilityTracker) {
                addViewabilityTracker(
                    adSlot,
                    params.id,
                    params.viewabilityTracker
                );
            }
            adSlot.classList.add('ad-slot--fabric');
            if (
                adSlot.parentNode &&
                ((adSlot.parentNode: any): Element).classList.contains(
                    'top-banner-ad-container'
                )
            ) {
                ((adSlot.parentNode: any): Element).classList.add(
                    'top-banner-ad-container--fabric'
                );
            }
            return true;
        });
    };

    return Object.freeze({
        create,
    });
};

export { FabricExpandableVideoV2 };
