define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-liveblog.html'
], function (
    contributionsUtilities,
    geolocation,
    template,
    config,
    liveblogEpicTemplate
) {

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicLiveblog',
        campaignId: 'epic_liveblog',
        campaignSuffix: config.page.pageId.replace(/-/g, '_').replace(/\//g, '__'),

        start: '2017-04-01',
        expiry: '2018-04-01',

        author: 'Joseph Smith',
        description: 'This places the epic underneath liveblog blocks which the author has specified in Composer should have an epic against them',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        pageCheck: function(page) {
            return page.contentType === 'LiveBlog';
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
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {
                    return template(liveblogEpicTemplate, {
                        membershipUrl: variant.membershipURL,
                        contributionUrl: variant.contributeURL,
                        componentName: variant.componentName
                    });
                },
            }
        ]
    });
});
