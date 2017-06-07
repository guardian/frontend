define([
    'common/modules/commercial/contributions-utilities',
    'lib/$',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'common/modules/commercial/acquisitions-copy',

], function (
    contributionsUtilities,
    $,
    geolocation,
    template,
    config,
    epicControlTemplate,
    acquisitionsCopy
) {
    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsElectionInteractiveEnd',
        campaignId: 'epic_ge2017_interactive_end',

        start: '2017-05-22',
        expiry: '2017-07-03',

        author: 'Sam Desborough',
        description: 'This places the epic underneath UK election-related interactives',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        showForSensitive: true,

        pageCheck: function(page) {
            return page.keywordIds &&
                page.keywordIds.includes('general-election-2017') &&
                page.contentType === 'Interactive';
        },

        variants: [
            {
                id: 'control',
                isUnlimited: true,

                insertAtSelector: '.content-footer',
                successOnView: true,

                template: function makeControlTemplate(variant) {
                    return template(epicControlTemplate, {
                        copy: acquisitionsCopy.control,
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName,
                        testimonialBlock: variant.options.testimonialBlock,
                        epicClass: 'contributions__epic--interactive gs-container',
                        wrapperClass: 'contributions__epic-interactive-wrapper'
                    });
                }
            }
        ]
    });
});
