// @flow

import marque36icon from 'svgs/icon/marque-36.svg';
import closeCentralIcon from 'svgs/icon/close-central.svg';

export const acquisitionsBannerCovidTemplate = (
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

        <div class="engagement-banner__container engagement-banner__container--covid-banner">
            <div class="engagement-banner__header-container">
                <div class="engagement-banner__header">
                    <h2 class="engagement-banner__header-text">${
                        params.titles ? params.titles[0] : ''
                    }</h2>
                </div>
            </div>

            <div class="engagement-banner__text-container">
                <div class="engagement-banner__body">
                    <p><span class="engagement-banner__lead-sentence">${
                        params.leadSentence ? params.leadSentence : ''
                    }</span>${params.messageText}</p>
                </div>

                <div class="engagement-banner__cta-container">
                    <div class="engagement-banner__cta">
                        <a tabIndex="3" class="component-button component-button--hasicon-right component-button--secondary" href="${
                            params.linkUrl
                        }">
                            ${params.buttonCaption}
                            <svg
                                class="svg-arrow-right-straight"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 17.89"
                                preserveAspectRatio="xMinYMid"
                                aria-hidden="true"
                                focusable="false"
                            >
                                <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                            </svg>
                        </a>
                    </div>


                    ${
                        params.secondaryLinkLabel && params.secondaryLinkUrl
                            ? `
                        <div class="engagement-banner__cta engagement-banner__cta--editorial">
                            <a tabIndex="3" class="component-button component-button--hasicon-right component-button--primary" href="${
                                params.secondaryLinkUrl
                            }">
                                    ${params.secondaryLinkLabel}
                                    <svg
                                        class="svg-arrow-right-straight"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 17.89"
                                        preserveAspectRatio="xMinYMid"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
                                    </svg>
                                </a>
                            </div>`
                            : ''
                    }

                </div>
            </div>
    `;
