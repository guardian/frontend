// @flow
import { makeABTest, defaultCanEpicBeDisplayed } from 'common/modules/commercial/contributions-utilities';
import {
    paradiseHighlight,
    paradiseDifferentHighlight,
} from 'common/modules/commercial/acquisitions-copy';
import config from 'lib/config';

const tagsMatch = () => {
    var pageKeywords = config.page.nonKeywordTagIds;
    if (typeof(pageKeywords) !== 'undefined') {
        var keywordList = pageKeywords.split(',');
        console.log(keywordList);
        return keywordList.some(x => (x === 'news/series/paradise-papers'));
    } else {
        return false;
    }
};

export const acquisitionsEpicParadise = makeABTest({
    id: 'AcquisitionsEpicParadise',
    campaignId: 'epic_paradise',

    start: '2017-11-02',
    expiry: '2017-11-23',

    author: 'Jonathan Rankin',
    description:
        'Test highlighting a different part of the epic when running against a particular story',
    successMeasure: 'AV2.0',
    idealOutcome: 'We find a winning variant',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    overrideCanRun: true,
    canRun : () => {
        return tagsMatch();
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                isUnlimited: true,
            },
        },
        {
            id: 'different_highlight',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            options: {
                copy: paradiseDifferentHighlight,
                isUnlimited: true,
            },
        },
    ],
});
