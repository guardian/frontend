define([
    'fastdom',
    'qwery',
    'Promise',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/space-filler',
    'common/modules/ui/images',
    'template!common/views/content/richLinkTag.html',
    'lodash/collections/contains'
], function (
    fastdom,
    qwery,
    Promise,
    $,
    ajax,
    config,
    detect,
    mediator,
    spaceFiller,
    imagesModule,
    richLinkTagTmpl,
    contains) {
    function upgradeRichLink(el) {
        var href = $('a', el).attr('href'),
            matches = href.match(/(?:^https?:\/\/(?:www\.|m\.code\.dev-)theguardian\.com)?(\/.*)/);

        if (matches && matches[1]) {
            return ajax({
                url: '/embed/card' + matches[1] + '.json',
                crossOrigin: true
            }).then(function (resp) {
                if (resp.html) {
                    fastdom.write(function () {
                        $(el).html(resp.html)
                            .removeClass('element-rich-link--not-upgraded')
                            .addClass('element-rich-link--upgraded');
                        imagesModule.upgradePictures(el);
                        $('.submeta-container--break').removeClass('submeta-container--break');
                        mediator.emit('rich-link:loaded', el);
                    });
                }
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function getSpacefinderRules() {
        return {
            minAbove: 200,
            minBelow: 250,
            clearContentMeta: 50,
            selectors: {
                ' > h2': {minAbove: detect.getBreakpoint() === 'mobile' ? 20 : 0, minBelow: 200},
                ' > *:not(p):not(h2):not(blockquote)': {minAbove: 35, minBelow: 300},
                ' .ad-slot': {minAbove: 150, minBelow: 200},
                ' .element-rich-link': {minAbove: 500, minBelow: 500}
            }
        };
    }

    function insertTagRichLink() {
        var $insertedEl,
            richLinkHrefs = $('.element-rich-link a')
                .map(function (el) { return $(el).attr('href'); }),
            testIfDuplicate = function (richLinkHref) {
                // Tag-targeted rich links can be absolute
                return contains(config.page.richLink, richLinkHref);
            },
            isDuplicate = richLinkHrefs.some(testIfDuplicate),
            isSensitive = config.page.shouldHideAdverts || !config.page.showRelatedContent;

        if (config.page.richLink &&
            config.page.richLink.indexOf(config.page.pageId) === -1 &&
            !isSensitive &&
            !isDuplicate
        ) {
            return spaceFiller.insertAtFirstSpace(getSpacefinderRules(), function (para) {
                $insertedEl = $.create(richLinkTagTmpl({href: config.page.richLink}));
                $insertedEl.insertBefore(para);
            }).then(function (didInsert) {
                if (didInsert) {
                    return Promise.resolve(upgradeRichLink($insertedEl[0]));
                } else {
                    return Promise.resolve(null);
                }
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function upgradeRichLinks() {
        $('.element-rich-link--not-upgraded').each(upgradeRichLink);
    }

    return {
        upgradeRichLinks: upgradeRichLinks,
        insertTagRichLink: insertTagRichLink,
        getSpacefinderRules: getSpacefinderRules
    };
});
