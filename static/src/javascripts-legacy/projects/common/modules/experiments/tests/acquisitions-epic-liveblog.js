define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'raw-loader!common/views/acquisitions-epic-liveblog.html'
], function (
    contributionsUtilities,
    geolocation,
    template,
    liveblogEpicTemplate
) {

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicLiveblog',
        campaignId: 'epic_liveblog',

        start: '2017-04-01',
        expiry: '2018-04-01',

        author: 'Joseph Smith',
        description: '',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        template: function(variant) {
            template(liveblogEpicTemplate, {
                membershipUrl: variant.membershipURL,
                contributionUrl: variant.contributeURL,
                componentName: variant.componentName
            });
        },

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                insertBeforeSelector: '.js-liveblog-epic-placeholder',
                successOnView: true
            }
        ]
    });
});
