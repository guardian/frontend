// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { shouldSeeReaderRevenue } from 'common/modules/commercial/user-features';
import config from 'lib/config';

const abTestName = 'AcquisitionsEpicCambridgeAnalyticaAlwaysAsk';

const tagsMatch = () => {
    const pageKeywords = config.page.nonKeywordTagIds;
    if (typeof pageKeywords !== 'undefined') {
        const keywordList = pageKeywords.split(',');
        return keywordList.some(
            x => x === 'news/series/cambridge-analytica-files'
        );
    }
    return false;
};

const worksWellWithPageTemplate = () =>
    config.page.contentType === 'Article' &&
    !config.page.isMinuteArticle &&
    !(config.page.isImmersive === true);

const isTargetPage = () =>
    worksWellWithPageTemplate() && !config.page.shouldHideReaderRevenue;

export const acquisitionsEpicCambridgeAnalyticaAlwaysAsk: EpicABTest = makeABTest(
    {
        id: abTestName,
        campaignId: abTestName,

        start: '2018-03-20',
        expiry: '2018-04-10',

        author: 'Jonathan Rankin',
        description:
            'This test aims to measure the impact of placing an ever-present ask on "moment" stories',
        successMeasure: 'Conversion rate',
        idealOutcome:
            'We learn the impact of placing an ever-present ask on "moment" stories',

        audienceCriteria: 'All',
        audience: 0.2,
        audienceOffset: 0,
        overrideCanRun: true,
        canRun: () => tagsMatch() && shouldSeeReaderRevenue() && isTargetPage(),

        variants: [
            {
                id: 'control',
                products: [],
            },
            {
                id: 'always_ask',
                products: [],
                options: {
                    isUnlimited: true,
                },
            },
        ],
    }
);
