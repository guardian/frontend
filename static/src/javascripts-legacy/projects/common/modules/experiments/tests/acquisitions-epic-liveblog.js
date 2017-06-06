define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'raw-loader!common/views/acquisitions-epic-liveblog.html',
    'common/modules/commercial/acquisitions-copy',
], function (
    contributionsUtilities,
    geolocation,
    template,
    config,
    liveblogEpicTemplate,
    acquisitionsCopy
) {
    var pageId = config.page.pageId || '';

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicLiveblog',
        campaignId: 'epic_liveblog',
        campaignSuffix: pageId.replace(/-/g, '_').replace(/\//g, '__'),

        start: '2017-04-01',
        expiry: '2018-04-01',

        author: 'Joseph Smith',
        description: 'This places the epic underneath liveblog blocks which the author has specified in Composer should have an epic against them',
        successMeasure: 'Member acquisition and contributions',
        idealOutcome: 'Our wonderful readers will support The Guardian in this time of need!',

        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,

        showForSensitive: true,

        pageCheck: function(page) {
            return page.contentType === 'LiveBlog';
        },

        variants: [
            {
                id: 'control',
                isUnlimited: true,

                insertAtSelector: '.js-insert-epic-after',
                insertAfter: true,
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {
                    return template(liveblogEpicTemplate, {
                        copy: acquisitionsCopy.control,
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },
            }
        ]
    });
});
