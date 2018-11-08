// @flow
import potentialTitleWide from 'svgs/fivbanner/potential-title-wide.svg';
import circles from 'svgs/fivbanner/circles.svg';
import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import arrowRight from 'svgs/icon/arrow-right.svg';

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
            <div class="fiv-banner__headline fiv_banner__potential">
                ${potentialTitleWide.markup}
            </div>
            <div class="fiv-banner__text_bold">
                …we remain editorially independent, our journalism free from commercial bias and our reporting open and accessible to all.
            </div>
            <div class="fiv-banner__text_normal">
                Imagine what we could continue to achieve with the support of many more of you. Together we can be a force for change.
            </div>
        </div>
        <div class="fiv-banner__onwards">
            <a class="fiv-banner__onwards" href="${linkUrl}">
                Read our story${arrowRight.markup}
            </a>
        </div>
        <div class="fiv-banner__cta">
            <button class="button fiv-banner__button fiv-banner__button_contribute" href="${linkUrl}">
                Contribute${arrowRight.markup}
            </button>
            <button class="button fiv-banner__button fiv-banner__button_subscribe" href="${linkUrl}">
                Subscribe${arrowRight.markup}
            </button>
        </div>
    </div>
    <a
        class="u-faux-block-link__overlay"
        target="_blank"
        href="${linkUrl}"
    ></a>
    `;
