define([
    'lodash/utilities/template',
    'commercial/modules/user-features',
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'raw-loader!common/views/epic-for-brexit-cohort.html'
], function (
    template,
    userFeatures,
    contributionsUtilities,
    config,
    epicForBrexitCohortTemplate
) {
    function isTargetReader() {
        return userFeatures.isInBrexitCohort();
    }

    function worksWellWithPageTemplate() {
        return config.page.contentType === 'Article' &&
            !config.page.isMinuteArticle &&
            !(config.page.isImmersive === true)
    }

    function isTargetPage() {
        return worksWellWithPageTemplate() &&
            !config.page.isPaidContent &&
            !config.page.shouldHideAdverts
    }

    return contributionsUtilities.makeABTest({

        id: 'EpicForBrexitCohort',
        campaignId: 'epic_brexit_cohort',

        start: '2017-06-06',
        expiry: '2017-07-09',

        author: 'Leigh-Anne Mathieson',
        description: 'Special message in an epic for the brexit cohort.',
        successMeasure: 'Reducing churn of members who joined in the Brexit cohort',
        idealOutcome: 'Members who joined in the Brexit cohort will be more likely to support us.',
        audienceCriteria: 'Readers who began supporting the Guardian in the Brexit cohort',
        audience: 0,
        audienceOffset: 1,

        overrideCanRun: true,

        canRun: function() {
            return isTargetReader() && isTargetPage();
        },

        useLocalViewLog: true,

        variants: [
            {
                id: 'control',

                maxViews: {
                    days: 1, // see it plenty of times for testing
                    count: 100, //TODO: adjust
                    minDaysBetweenViews: 0
                },

                template: function(variant) {
                    return template(epicForBrexitCohortTemplate, {
                        componentName: variant.options.componentName,
                        membershipUrl: variant.getURL("https://www.theguardian.com/membership", variant.options.campaignCode)
                    })
                }

            }
        ]
    });
});
