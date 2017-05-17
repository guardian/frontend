define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-single-cta-contribute.html',
    'raw-loader!common/views/acquisitions-epic-single-cta-support.html'
], function (
    contributionsUtilities,
    geolocation,
    template,
    config,
    acquisitionsEpicContributeTemplate,
    acquisitionsEpicSupportTemplate
) {
    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicSingleCta',
        campaignId: 'epic_single_cta',

        start: '2017-05-12',
        expiry: '2017-05-25',

        author: 'Joseph Smith',
        description: 'Test an epic with a single CTA: contribute in the US and support everywhere else',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Overall number of conversions combining supporter and contributions will be greater for the variant that shows just a single CTA',

        audienceCriteria: 'All',
        audience: 0.5,
        audienceOffset: 0.5,

        variants: [
            {
                id: 'control',
                successOnView: true, // check
            },
            {
                id: 'single_cta',
                template: function(variant) {
                    var epicTemplate;

                    if (geolocation.getSync() === 'US') {
                        epicTemplate = acquisitionsEpicContributeTemplate;
                    } else {
                        epicTemplate = acquisitionsEpicSupportTemplate;
                    }

                    return template(epicTemplate, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                }
            }
        ]
    });
});
