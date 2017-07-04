define([
    'commercial/modules/commercial-features',
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'lib/cookies',


], function (
            commercialFeatures,
            contributionsUtilities
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAlwaysAskStrategy',
        campaignId: 'epic_always_ask_strategy',

        start: '2016-12-06',
        expiry: '2018-07-19',

        author: 'Guy Dawson',
        description: 'Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period.',
        successMeasure: 'We are able to measure the positive and negative effects of this strategy.',
        idealOutcome: 'There are no negative effects and this is the optimum strategy!',

        audienceCriteria: 'All',
        audience: 0.02,
        audienceOffset: 0.88,
        useTargetingTool: true,

        overrideCanRun: true,
        canRun: function () {
            return true;
        },

        variants: [
            {
                id: 'control',
                test: function() {},
                isUnlimited : true

            },

            {
                id: 'alwaysAsk',
                test: function (render, variant, parentTest) {
                    if (contributionsUtilities.defaultCanEpicBeDisplayed(parentTest)) {
                        render();
                    }
                },
                isUnlimited : true,
                successOnView: true
            }
        ]
    });
});
