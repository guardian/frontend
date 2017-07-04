define([
    'common/modules/commercial/contributions-utilities',
    'common/modules/commercial/acquisitions-view-log',
    'lodash/utilities/template',
    'lib/$',
    'lib/config',
    'lib/mediator',
    'lib/element-inview',
    'lib/fastdom-promise',
    'raw-loader!common/views/acquisitions-epic-liveblog.html',
    'common/modules/commercial/acquisitions-copy',
], function (
    contributionsUtilities,
    viewLog,
    template,
    $,
    config,
    mediator,
    ElementInView,
    fastdom,
    liveblogEpicTemplate,
    acquisitionsCopy
) {
    var pageId = config.page.pageId || '';

    var isAutoUpdateHandlerBound = false;

    var INSERT_EPIC_AFTER_CLASS = 'js-insert-epic-after';

    function setupViewTracking(el, test) {
        // top offset of 18 ensures view only counts when half of element is on screen
        var elementInView = ElementInView(el, window, { top: 18 });

        elementInView.on('firstview', function () {
            viewLog.logView(test.id);
            mediator.emit(test.viewEvent);
        });
    }

    function addEpicToBlocks(epicHtml, test) {
        return fastdom.write(function() {
            var $blocksToInsertEpicAfter = $('.' + INSERT_EPIC_AFTER_CLASS);

            $blocksToInsertEpicAfter.each(function(el) {
                var $epic = $.create(epicHtml);
                $epic.insertAfter(el);
                $(el).removeClass(INSERT_EPIC_AFTER_CLASS);

                setupViewTracking(el, test);
            });
        });
    }

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

                test: function(renderFn, variant, test) {
                    var epicHtml = variant.options.template(variant);
                    addEpicToBlocks(epicHtml, test);

                    if (!isAutoUpdateHandlerBound) {
                        mediator.on('modules:autoupdate:updates', function() {
                            addEpicToBlocks(epicHtml, test);
                        });
                        isAutoUpdateHandlerBound = true;
                    }
                }
            }
        ]
    });
});
