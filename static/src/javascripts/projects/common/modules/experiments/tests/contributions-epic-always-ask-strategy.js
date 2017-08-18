// @flow
import {
    makeABTest,
    defaultCanEpicBeDisplayed,
} from 'common/modules/commercial/contributions-utilities';
import 'lib/config';
import 'lib/cookies';

export const alwaysAsk: EpicABTest = makeABTest({
    id: 'ContributionsEpicAlwaysAskStrategy',
    campaignId: 'epic_always_ask_strategy',

    start: '2016-12-06',
    expiry: '2018-07-19',

    author: 'Guy Dawson',
    description:
        'Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period.',
    successMeasure:
        'We are able to measure the positive and negative effects of this strategy.',
    idealOutcome:
        'There are no negative effects and this is the optimum strategy!',

    audienceCriteria: 'All',
    audience: 0.02,
    audienceOffset: 0.88,
    useTargetingTool: true,

    overrideCanRun: true,
    canRun() {
        return true;
    },

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                test() {},
                isUnlimited: true,
            },
        },

        {
            id: 'alwaysAsk',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                test(render, variant, parentTest) {
                    if (defaultCanEpicBeDisplayed(parentTest)) {
                        render();
                    }
                },
                isUnlimited: true,
                successOnView: true,
            },
        },
    ],
});
