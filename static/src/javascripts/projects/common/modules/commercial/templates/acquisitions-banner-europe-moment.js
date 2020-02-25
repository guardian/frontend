// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';

export const acquisitionsBannerEuropeMomentTemplate = (
    params: EngagementBannerTemplateParams
): string => `
        <div class="engagement-banner__close">
            <div class="engagement-banner__roundel hide-until-phablet">
                ${marque36icon.markup}
            </div>
            <button tabindex="4" class="button engagement-banner__close-button js-site-message-close js-engagement-banner-close-button" data-link-name="hide release message">
                <span class="u-h">Close the support banner</span>
                ${closeCentralIcon.markup}
            </button>
        </div>

        <div class="engagement-banner__container">
            <div class="engagement-banner__text-container">
                <div class="engagement-banner__header">
                    </h2>${
                        params.titles && params.titles[0]
                            ? params.titles[0]
                            : ''
                    }</h2>
                </div>
                <div class="engagement-banner__body">
                    <p>${params.messageText}</p>
                </div>
            </div>
        </div>
    `;
