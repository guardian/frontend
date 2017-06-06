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
        id: 'AcquisitionsEpicAlwaysAskElection',
        campaignId: 'epic_always_ask_election',

        start: '2017-06-01',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This will guarantee that the epic is always displayed on election stories',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We can always show the epic on election articles',
        audienceCriteria: 'All',
        audience: 1,
        locations: ['GB'],
        audienceOffset: 0,
        useTargetingTool: true,

        variants: [
            {
                id: 'control',
                isUnlimited : true,
                successOnView: true,
                test: function(render) {
                    tailor.isRegular().then(function (regular) {
                        var copy = regular ? acquisitionsCopy.regulars: acquisitionsCopy.control;
                        return render(function(variant) {
                            return template(acquisitionsEpicControlTemplate, {
                                copy: copy,
                                membershipUrl: variant.options.membershipURL,
                                contributionUrl: variant.options.contributeURL,
                                componentName: variant.options.componentName
                            });
                        });
                    });
                }
            }
        ]
    });
});
