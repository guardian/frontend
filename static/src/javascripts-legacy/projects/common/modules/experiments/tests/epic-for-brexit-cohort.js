define([
    'lodash/utilities/template',
    'commercial/modules/user-features',
    'common/modules/commercial/contributions-utilities',
    'lib/config',
    'raw-loader!common/views/epic-for-brexit-cohort.html',
    'svgs/icon/quote.svg',
    'common/modules/commercial/acquisitions-epic-testimonial-parameters'
], function (
    template,
    userFeatures,
    contributionsUtilities,
    config,
    epicForBrexitCohortTemplate,
    quoteSvg,
    acquisitionsEpicTestimonialParameters
) {

    function hasBrexitTag(){
        var tags = config.page.keywordIds.concat(config.page.nonKeywordTagIds);
        return tags.indexOf('politics/eu-referendum') > -1;
    }

    function createBrexitTestTemplate() {
        return function(variant){
            return template(epicForBrexitCohortTemplate, {
                componentName: variant.options.componentName,
                testimonialBlock: contributionsUtilities.getTestimonialBlock(acquisitionsEpicTestimonialParameters.brexit)
            });
        }
    }

    return contributionsUtilities.makeABTest({

        id: 'EpicForBrexitCohort',
        campaignId: 'epic_brexit_cohort',

        start: '2017-06-19',
        expiry: '2017-07-31',

        author: 'Leigh-Anne Mathieson',
        description: 'Special message in an epic for the brexit cohort.',
        successMeasure: 'Reducing churn of members who joined in the Brexit cohort',
        idealOutcome: 'Members who joined in the Brexit cohort will be more likely to continue supporting us.',
        audienceCriteria: 'Readers who began supporting the Guardian in the Brexit cohort',
        audience: 1,
        audienceOffset: 0,

        canRun: function() {
            return userFeatures.isInBrexitCohort() && hasBrexitTag();
        },

        useLocalViewLog: true,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0 // Same as ask four for now
                },
                template: createBrexitTestTemplate()
            }
        ]
    });
});
