define([
    'common/modules/commercial/contributions-utilities',
    'lib/$',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'common/modules/commercial/acquisitions-copy',

], function (contributionsUtilities,
             $,
             geolocation,
             template,
             config,
             epicControlTemplate,
             acquisitionsCopy) {
    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsInteractiveEnd',
        campaignId: 'epic_interactive_end',

        start: '2017-05-22',
        expiry: '2018-07-03',

        author: 'Sam Desborough',
        description: 'This places the epic underneath certain interactives',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        pageCheck: function(page) {
            var isElection = page.keywordIds &&
                page.keywordIds.includes('general-election-2017') &&
                page.contentType === 'Interactive';

            var isFootball = page.pageId.indexOf('transfer-window-2017-every-deal-in-europes-top-five-leagues') > -1;

            return isElection || isFootball;
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
                        componentName: variant.options.componentName,
                        buttonTemplate: contributionsUtilities.defaultButtonTemplate({
                            membershipUrl: variant.options.membershipURL,
                            contributeUrl: variant.options.contributeURL,
                            supportUrl: variant.options.supportURL,
                        }),
                        testimonialBlock: variant.options.testimonialBlock,
                        epicClass: 'contributions__epic--interactive gs-container',
                        wrapperClass: 'contributions__epic-interactive-wrapper'
                    });
                }
            }
        ]
    });
});
