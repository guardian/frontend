// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

const campaignTag = 'us-news/series/break-the-cycle';

const tagsMatch = () =>
    config
        .get('page.nonKeywordTagIds', '')
        .split(',')
        .includes(campaignTag);

export const acquisitionsEpicUSGunCampaignInteractive = makeABTest({
    id: 'AcquisitionsUsGunCampaignInteractive2017',
    campaignId: 'epic_us_gun_campaign_interactive_2017',

    start: '2017-11-14',
    expiry: '2018-01-04',

    author: 'Sam Desborough',
    description:
        'Show a custom Epic for interactives with the US gun campaign tag',
    successMeasure: 'AV2.0',
    idealOutcome:
        'The US gun campaign resonates with our readers, and we continue to provide quality reporting on this important issue',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    canRun: tagsMatch,
    pageCheck: page => page.contentType === 'Interactive',

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION'],
            options: {
                isUnlimited: true,
                usesIframe: true,
                template: variant =>
                    `<iframe src="https://interactive.guim.co.uk/embed/2017/11/break-the-cycle/epic.html"
                        data-component="${variant.options.componentName}"
                        class="acquisitions-epic-iframe contributions__epic-interactive-wrapper contributions__epic-interactive-wrapper--gun-campaign"
                        id="${variant.options.iframeId}">
                    </iframe>`,
                insertAtSelector: '.content__main-column--interactive',
                insertAfter: true,
            },
        },
    ],
});
