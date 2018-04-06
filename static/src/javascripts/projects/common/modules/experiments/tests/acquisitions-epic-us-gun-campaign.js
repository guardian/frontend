// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import {
    isPayingMember,
    isRecentContributor,
} from 'common/modules/commercial/user-features';

const campaignTag = 'us-news/series/break-the-cycle';

const tagsMatch = () =>
    config
        .get('page.nonKeywordTagIds', '')
        .split(',')
        .includes(campaignTag);

const isTargetReader = () => isPayingMember() || isRecentContributor();

const isTargetPage = () => tagsMatch() && !config.page.shouldHideReaderRevenue;

export const acquisitionsEpicUSGunCampaign = makeABTest({
    id: 'AcquisitionsUsGunCampaign2017',
    campaignId: 'epic_us_gun_campaign_2017',

    start: '2017-11-14',
    expiry: '2018-01-04',

    author: 'Guy Dawson',
    description:
        'Show a custom thank you epic for articles with the US gun campaign tag',
    successMeasure: 'AV2.0',
    idealOutcome:
        'The US gun campaign resonates with our readers, and we continue to provide quality reporting on this important issue',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    showToContributorsAndSupporters: true,

    canRun() {
        return isTargetReader() && isTargetPage();
    },
    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION'],
            options: {
                isUnlimited: true,
                usesIframe: true,
                template: variant =>
                    `<iframe src="https://interactive.guim.co.uk/embed/2018/03/break-the-cycle/epic.html"
                        data-component="${variant.options.componentName}"
                        class="acquisitions-epic-iframe"
                        id="${variant.options.iframeId}">
                    </iframe>`,
            },
        },
    ],
});
