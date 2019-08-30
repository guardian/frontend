// @flow
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import { supportSubscribeDigitalURL } from 'common/modules/commercial/support-utilities';
import config from 'lib/config';

const supportUrl = `${supportSubscribeDigitalURL()}?acquisitionData=%7B%22componentType%22%3A%22ACQUISITIONS_OTHER%22%2C%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22shady_pie_open_2019%22%2C%22componentId%22%3A%22shady_pie_open_2019%22%7D&INTCMP=shady_pie_open_2019`;

const askHtml = `
<div class="contributions__adblock">
    <div class="contributions__adblock-content">
        <div class="contributions__adblock-header">
            <h2>
                Editorially<br>
                independent,<br>
                open to everyone
            </h2>
        </div>
        <div class="contributions__adblock-sub">
            We chose a different approach —<br>
            will you support it?
        </div>
        <a class="contributions__adblock-button" href="${supportUrl}">
            <span class="component-button__content">Find out more</span>
            <svg class="svg-arrow-right-straight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17.89" preserveAspectRatio="xMinYMid">
                <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z"></path>
            </svg>
        </a>
    </div>
</div>
`;

export const adblockTest: ABTest = {
    id: 'AdblockAsk',
    start: '2019-02-20',
    expiry: '2020-02-20',
    author: 'Tom Forbes',
    description:
        'Places a contributions ask underneath the right-hand ad slot on articles.',
    audience: 1,
    audienceOffset: 0,
    successMeasure: '',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        return (
            !shouldHideSupportMessaging() &&
            !pageShouldHideReaderRevenue() &&
            !config.get('page.hasShowcaseMainElement')
        );
    },

    variants: [
        {
            id: 'control',
            test: (): void => {
                const slot = document.querySelector('.js-aside-slot-container');
                if (slot) {
                    slot.innerHTML += askHtml;
                }
            },
        },
    ],
};
