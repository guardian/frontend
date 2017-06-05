define([
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'raw-loader!common/views/acquisitions-epic-control-regulars.html',
    'common/modules/tailor/tailor',
    'lodash/utilities/template'

], function (
    contributionsUtilities,
    acquisitionsEpicControlTemplate,
    acquisitionsEpicControlTemplateRegulars,
    tailor,
    template
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
                        var t = regular ? acquisitionsEpicControlTemplateRegulars : acquisitionsEpicControlTemplate;

                        return render(function(variant) {
                            return template(t, {
                                membershipUrl: variant.options.membershipURL,
                                contributionUrl: variant.options.contributeURL,
                                componentName: variant.options.componentName
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
