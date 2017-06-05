define([
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'common/modules/tailor/tailor',
    'lodash/utilities/template',
    'common/modules/commercial/acquisitions-copy'

], function (
    contributionsUtilities,
    acquisitionsEpicControlTemplate,
    tailor,
    template,
    acquisitionsCopy
) {

   return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAskFourEarning',
        campaignId: 'kr1_epic_ask_four_earning',

        start: '2017-01-24',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Acquires many Supporters',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                test: function(render) {
                    tailor.isRegular().then(function (regular) {
                        var copy = regular ? acquisitionsCopy.regulars: acquisitionsCopy.control;
                        return render(function(variant) {
                            return template(acquisitionsEpicControlTemplate, {
                                copy: copy,
                                membershipUrl: variant.options.membershipURL,
                                contributionUrl: variant.options.contributeURL,
                                componentName: variant.options.componentName,
                                testimonialBlock: variant.options.testimonialBlock
                            });
                        });
                    });
                },
                insertAtSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
