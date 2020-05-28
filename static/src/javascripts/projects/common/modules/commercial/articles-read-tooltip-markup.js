// @flow
import closeIcon from 'svgs/icon/close-large.svg';

export const articlesReadTooltipMarkup = (count: number, nextWord: ?string): string => `
    <span class="engagement-banner__articles-read-tooltip-wrapper">
        <span class="engagement-banner__articles-read">
            ${count.toString()}${nextWord ? ` ${nextWord}` : ''}
        </span>

        <span class="engagement-banner__articles-read-tooltip">
            <span class="engagement-banner__articles-read-tooltip-close is-hidden">
                <button tabindex="4" class="engagement-banner__articles-read-tooltip-close-button js-site-message-close" data-link-name="hide release message">
                    <span class="u-h">Close the articles viewed opt out message</span>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.32497 10.025L15.5499 16.6499L16.6249 15.5749L10.025 8.32497L16.6249 1.075L15.5499 0L8.32497 6.62498L1.075 0.0249999L0 1.1L6.62498 8.32497L0 15.5499L1.075 16.6249L8.32497 10.025Z"/>
                    </svg>
                </button>
            </span>
            <span class="engagement-banner__articles-read-tooltip-header">What's this?</span>
            <span class="engagement-banner__articles-read-tooltip-body">We would like to remind you how many Guardian articles you've enjoyed on this device. Can we continue showing you this?</span>
            <span class="engagement-banner__articles-read-tooltip-buttons">
                <a class="component-button contributions__contribute--epic-member engagement_banner__articles-read-tooltip-button-opt-in" target="_blank">
                    Yes, that's OK
                </a>

                <a class="component-button contributions__contribute--epic-member engagement_banner__articles-read-tooltip-button-opt-out" target="_blank">
                    No, opt me out
                </a>
            </span>
            <span class="engagement-banner__articles-read-tooltip-note">Please note you cannot undo this action or opt back in</span>
        </span>
    </span>
`;
