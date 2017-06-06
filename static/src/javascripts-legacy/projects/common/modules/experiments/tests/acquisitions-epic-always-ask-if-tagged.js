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
        id: 'AcquisitionsEpicAlwaysAskIfTagged',
        campaignId: 'epic_always_ask_if_tagged',

        start: '2017-05-23',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We can always show the epic on articles with a pre selected tag',
        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,
        showForSensitive: true,
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
