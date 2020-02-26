// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';
import europeMomentDesktopImg from 'svgs/acquisitions/europe-moment-desktop.svg';
// import europeMomentMobileImg from 'svgs/acquisitions/europe-moment-mobile.svg';
// import beyondBordersGif from 'svgs/acquisitions/beyond_borders.gif';

export const acquisitionsBannerEuropeMomentTemplate = (
    params: EngagementBannerTemplateParams
): string => `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel">
                ${marque36icon.markup}
            </div>
            <button tabindex="4" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close the support banner</span>
                ${closeCentralIcon.markup}
            </button>
        </div>
        <div class="engagement-banner__container">
            <div class="engagement-banner__leftblock">
                <div class="engagement-banner__text-container">
                    <div class="engagement-banner__header--europe-moment">
                        <img src="https://uploads.guim.co.uk/2020/02/26/beyond_borders.gif">
                    </div>
                    <div class="engagement-banner__body">
                        <p>${params.messageText}</p>
                    </div>

                    <div class="engagement-banner__cta-container">
                        <div class="engagement-banner__cta">
                            <a tabIndex="3" class="component-button component-button--primary" href="${
                                params.linkUrl
                            }">
                                ${params.buttonCaption}
                            </a>
                        </div>
                        <div class="engagement-banner__cta engagement-banner__cta--editorial">
                            <a tabIndex="3" class="component-button component-button--greyHollow component-button--greyHollow--eoy" href="${'#'}">
                                Read more
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="engagement-banner__rightblock engagement_banner__image"> ${
                europeMomentDesktopImg.markup
            }</div>
        </div>




    `;
