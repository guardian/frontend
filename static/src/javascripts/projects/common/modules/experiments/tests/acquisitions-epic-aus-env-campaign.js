// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

const campaignTag = 'environment/series/our-wide-brown-land';

const tagsMatch = () =>
    config
        .get('page.nonKeywordTagIds', '')
        .split(',')
        .includes(campaignTag);

export const acquisitionsEpicAusEnvCampaign = makeABTest({
    id: 'AcquisitionsAustraliaEnvironmentCampaign2018',
    campaignId: 'aus_environment_campaign_2018',

    start: '2018-01-29',
    expiry: '2018-03-30',

    author: 'Joseph Smith',
    description: 'Show a custom Epic for articles with the wide brown land tag',
    successMeasure: 'AV2.0',
    idealOutcome:
        'The Australia environment campaign resonates with our readers, and we continue to provide quality reporting on this important issue',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: tagsMatch,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION'],
            options: {
                campaignCode: 'aus_environment_campaign_2018',
                isUnlimited: true,
                usesIframe: true,
                template: variant =>
                    `<iframe src="https://interactive.guim.co.uk/embed/2018/this-wide-brown-land/epic/epic.html"
                        data-component="${variant.options.componentName}"
                        class="acquisitions-epic-iframe"
                        id="${variant.options.iframeId}">
                    </iframe>`,
            },
        },
    ],
});
