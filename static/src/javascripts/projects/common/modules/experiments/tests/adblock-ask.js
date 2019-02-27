// @flow
import { userIsSupporter } from 'common/modules/commercial/user-features';
import { pageShouldHideReaderRevenue } from 'common/modules/commercial/contributions-utilities';

const supportUrl =
    'https://support.theguardian.com/contribute?acquisitionData=%7B%22componentType%22%3A%22ACQUISITIONS_OTHER%22%2C%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22shady_pie_open_2019%22%2C%22componentId%22%3A%22shady_pie_open_2019%22%7D&INTCMP=shady_pie_open_2019';

const askHtml = `
<div class="contributions__adblock--moment">
    <div class="contributions__adblock--moment-content">
        <div class="contributions__adblock--moment-header">
            <h2 class="contributions__adblock--moment-header--blue">Support</h2>
            <h2 class="contributions__adblock--moment-header--blue">The Guardian’s</h2>
            <h2 class="contributions__adblock--moment-header--orange">model for open, independent journalism</h2>
        </div>
        <div class="contributions__adblock--moment-sub">
            We’re available for everyone, supported by our readers
        </div>
        <div class="contributions__adblock--moment-button">
            <a class="contributions__option-button contributions__contribute "
              href="${supportUrl}"
              target="_blank">
              Support The Guardian
            </a>
        </div>
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
        return !userIsSupporter()
            && !pageShouldHideReaderRevenue()
            && !window.guardian.config.page.hasShowcaseMainElement;
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
