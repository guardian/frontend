define([
    'common/modules/commercial/contributions-utilities',
    'lib/geolocation',
    'lodash/utilities/template',
    'lib/config',
    'lib/$',
    'raw-loader!common/views/acquisitions-epic-liveblog.html',
    'raw-loader!common/views/acquisitions-epic-liveblog-old-design.html'
], function (
    contributionsUtilities,
    geolocation,
    template,
    config,
    $,
    liveblogEpicTemplateControl,
    liveblogEpicTemplateOldDesign
) {
    var pageId = config.page.pageId || '';

    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicLiveblogDesignTest',
        campaignId: 'epic_liveblog_design_test',
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
                    return template(liveblogEpicTemplateControl, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },
            },
            {
                id: 'old_design',
                isUnlimited: true,

                insertAtSelector: '.js-insert-epic-after',
                insertAfter: true,
                insertMultiple: true,
                successOnView: true,

                template: function (variant) {


                    return template(liveblogEpicTemplateOldDesign, {
                        membershipUrl: variant.options.membershipURL,
                        contributionUrl: variant.options.contributeURL,
                        componentName: variant.options.componentName
                    });
                },

                onInsert: function() {
                    $('.js-insert-epic-after').each(function(el) {
                        // Get time from liveblog post
                        var $timeEl = $('time', el);
                        var datetime = $timeEl.attr('datetime');
                        var title = $timeEl.attr('title');
                        var date = $timeEl.text();
                        var time = $('.block-time__absolute', el).text();

                        // Set time on epic
                        // TODO: handle case where ad intervenes between post and epic
                        var $epic = $(el).next();
                        var $epicTimeEl = $('time', $epic);
                        $epicTimeEl.attr('datetime', datetime);
                        $epicTimeEl.attr('title', title);
                        $epicTimeEl.text(date);
                        $('.block-time__absolute', $epic).text(time);
                    });
                }
            }
        ]
    });
});
