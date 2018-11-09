// @flow
import potentialTitleWide from 'svgs/fivbanner/potential-title-wide.svg';
import potentialTitleMobile from 'svgs/fivbanner/potential-title-mobile.svg';
import existingTitle from 'svgs/fivbanner/existing-title.svg';
import circles from 'svgs/fivbanner/circles.svg';
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowRight from 'svgs/icon/arrow-right.svg';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { shouldSeeReaderRevenue } from 'common/modules/commercial/user-features';

export const acquisitionsBannerFivTemplate = (
    location: string,
    linkUrl: string
): string =>
    `
    <div class="fiv-banner__background">
        <div class="fiv-banner__circles"
            ${circles.markup}
        </div>
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
    <div class="fiv-banner__container">
        <div class="fiv-banner__text">
        ${
            window.location.hash.match(/[#&]fiv-potential(&.*)?$/) ||
            (shouldSeeReaderRevenue &&
                !window.location.hash.match(/[#&]fiv-existing(&.*)?$/))
                ? `<div class="fiv-banner__headline fiv-banner__wide">
                ${potentialTitleWide.markup}
            </div><div class="fiv-banner__headline fiv-banner__mobile">
                ${potentialTitleMobile.markup}
            </div>
            <div class="fiv-banner__text_bold">
                …we remain editorially independent, our journalism free from commercial bias and our reporting open and accessible to all.
            </div>
            <div class="fiv-banner__text_normal">
                Imagine what we could continue to achieve with the support of many more of you. Together we can be a force for change.
            </div>`
                : `<div class="fiv-banner__headline">
                ${existingTitle.markup}
            </div>
            <div class="fiv-banner__text_bold">
                …to the 1,000,000 readers who have helped to keep The Guardian’s independent journalism open and accessible to all.
            </div>
            <div class="fiv-banner__text_normal">
                Imagine what the next million could achieve. Please read this update from our editor-in-chief and continue supporting us.
            </div>`
        }
        </div>
        <div class="fiv-banner__onwards">
            <a class="fiv-banner__onwards" href="${linkUrl}">
                Read our story${arrowRight.markup}
            </a>
        </div>
    </div>
    <div class="fiv-banner__cta">
        <button class="button fiv-banner__button fiv-banner__button_contribute" href="${linkUrl}">
            Contribute${arrowRight.markup}
        </button>
        ${
            window.location.hash.match(/[#&]fiv-gb(&.*)?$/) ||
            (geolocationGetSync() === 'GB' &&
                !window.location.hash.match(/[#&]fiv-row(&.*)?$/))
                ? `<button class="button fiv-banner__button fiv-banner__button_subscribe" href="${linkUrl}">
                Subscribe${arrowRight.markup}
            </button>`
                : ``
        }
    </div>
    <a
        class="u-faux-block-link__overlay"
        target="_blank"
        href="${linkUrl}"
    ></a>
    `;
