// @flow
import potentialTitleWide from 'svgs/fivbanner/potential-title-wide.svg';
import potentialTitleMobile from 'svgs/fivbanner/potential-title-mobile.svg';
import existingTitle from 'svgs/fivbanner/existing-title.svg';
import circles from 'svgs/fivbanner/circles.svg';
import circlesMobile from 'svgs/fivbanner/circles-mobile.svg';
import circlesMobileRow from 'svgs/fivbanner/circles-mobile-row.svg';
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowRight from 'svgs/icon/arrow-right.svg';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { shouldSeeReaderRevenue } from 'common/modules/commercial/user-features';

const isPotential =
    window.location.hash.match(/[#&]fiv-potential(&.*)?$/) ||
    (shouldSeeReaderRevenue() &&
        !window.location.hash.match(/[#&]fiv-existing(&.*)?$/));

const showSubscribe =
    window.location.hash.match(/[#&]fiv-gb(&.*)?$/) ||
    ((geolocationGetSync() === 'GB' || geolocationGetSync() === 'AU') &&
        !window.location.hash.match(/[#&]fiv-row(&.*)?$/));

const inAus =
    window.location.hash.match(/[#&]fiv-au(&.*)?$/) ||
    geolocationGetSync() === 'AU';

export const acquisitionsBannerFivTemplate = (
    location: string,
    linkUrl: string,
    subscribeUrl: string
): string =>
    `
    <div class="fiv-banner__background_desktop">
            ${circles.markup}
    </div>
    <div class="fiv-banner__background_mobile">
            ${showSubscribe ? circlesMobile.markup : circlesMobileRow.markup}
    </div>
    <div class="fiv-banner__close">
        <div class="fiv-banner__roundel">
            ${marque36icon.markup}
        </div>
        <button class="button fiv-banner__close-button js-site-message-close js-fiv-banner-close-button" data-link-name="hide release message">
            <span class="u-h">Close</span>
            ${closeCentralIcon.markup}
        </button>
    </div>
    <div class="fiv-banner__container fiv-banner__container-${
        isPotential ? `potential` : `existing`
    }${inAus ? `-aus` : ``}">
        ${
            isPotential
                ? `<div class="fiv-banner__text fiv-banner__text-potential">
        <div class="fiv-banner__headline-potential fiv-banner__u-show-from-tablet">
                ${potentialTitleWide.markup}
            </div><div class="fiv-banner__headline-potential fiv-banner__u-hide-from-tablet">
                ${potentialTitleMobile.markup}
            </div>
            ${
                inAus
                    ? `<p class="fiv-banner__text-paragraph">
                <span class="fiv-banner__text_bold">
                    …we remain editorially independent, our journalism free from commercial bias and our reporting open and accessible to all. Imagine what we could continue to achieve with the support of many more of you.
                </span>
                <span class="fiv-banner__text_normal">
                    Together we can be a force for change. Please consider supporting us today
                </span>
            </p>`
                    : `<p class="fiv-banner__text-paragraph">
                <span class="fiv-banner__text_bold">
                    …we remain editorially independent, our journalism free from commercial bias and our reporting open and accessible to all.
                </span>
                <span class="fiv-banner__text_normal">
                    Imagine what we could continue to achieve with the support of many more of you. Together we can be a force for change.
                </span>
            </p>`
            }`
                : `<div class="fiv-banner__text fiv-banner__text-existing">
        <div class="fiv-banner__headline-existing">
                ${existingTitle.markup}
            </div>
            ${
                inAus
                    ? `<p class="fiv-banner__text-paragraph fiv-banner__text-paragraph-existing">
                <span class="fiv-banner__text_bold">
                    …to the 1,000,000 readers around the world who have helped to keep The&nbsp;Guardian’s independent journalism open and accessible to all. And to our 89,000 supporters in Australia.
                </span>
                <span class="fiv-banner__text_normal">
                    Together we can be a force for change. Imagine what the next million could achieve. Please continue supporting us.
                </span>
            </p>`
                    : `<p class="fiv-banner__text-paragraph fiv-banner__text-paragraph-existing">
                <span class="fiv-banner__text_bold">
                    …to the 1,000,000 readers who have helped to keep The&nbsp;Guardian’s independent journalism open and accessible to all.
                </span>
                <span class="fiv-banner__text_normal">
                    Imagine what the next million could achieve. Please read this update from our editor-in-chief and continue supporting us.
                </span>
            </p>`
            }`
        }
            <div>
                <a class="fiv-banner__onwards" href="https://www.theguardian.com/membership/2018/nov/12/katharine-viner-guardian-million-reader-funding?INTCMP=onemillion_fiv">
                    Read our story${arrowRight.markup}
                </a>
            </div>
        </div>
        <div class="fiv-banner__cta">
            <a class="button fiv-banner__button fiv-banner__button_contribute" href="${linkUrl}" target="_blank">
                Contribute${arrowRight.markup}
            </a>
            ${
                showSubscribe
                    ? `<a class="button fiv-banner__button fiv-banner__button_subscribe" href="${subscribeUrl}" target="_blank">
                    Subscribe${arrowRight.markup}
                </a>`
                    : ``
            }
        </div>
    </div>
    `;
