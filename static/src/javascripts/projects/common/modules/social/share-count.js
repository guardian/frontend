define([
    'fastdom',
    'common/utils/report-error',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/formatters',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/content/share-count.html',
    'text!common/views/content/share-count-immersive.html'
], function (
    fastdom,
    reportError,
    $,
    ajax,
    detect,
    config,
    formatters,
    template,
    svgs,
    shareCountTemplate,
    shareCountImmersiveTemplate
) {
    var shareCount = 0,
        $shareCountEls = $('.js-sharecount'),
        $fullValueEls,
        $shortValueEls,
        tooltip = 'Facebook: <%=facebook%>',
        counts = {
            facebook: 'n/a'
        };

    function incrementShareCount(amount) {
        if (amount !== 0) {
            shareCount += amount;
            var displayCount = shareCount.toFixed(0),
                formattedDisplayCount = formatters.integerCommas(displayCount),
                shortDisplayCount = displayCount > 10000 ? Math.round(displayCount / 1000) + 'k' : displayCount;
            fastdom.write(function() {
                $fullValueEls.text(formattedDisplayCount);
                $shortValueEls.text(shortDisplayCount);
            });
        }
    }

    function updateTooltip() {
        $shareCountEls.attr('title', template(tooltip, counts));
    }

    function addToShareCount(val) {
        var shareSvg = svgs('share');
        var shareTemplate = $shareCountEls.hasClass('js-sharecount-immersive') ? shareCountImmersiveTemplate : shareCountTemplate;

        var html = template(shareTemplate, {
            icon: shareSvg
        });

        $shareCountEls
            .removeClass('u-h')
            .html(html)
            .css('display', '');

        $shortValueEls = $('.sharecount__value--short', $shareCountEls[0]); // limited to 1 el
        $fullValueEls = $('.sharecount__value--full', $shareCountEls[0]); // limited to 1 el

        incrementShareCount(val);
    }

    return function () {
        // asking for social counts in preview "leaks" upcoming URLs to social sites.
        // when they then crawl them they get 404s which affects later sharing.
        // don't call counts in preview
        if ($shareCountEls.length && !config.page.isPreview) {
            var url = 'http://www.theguardian.com/' + config.page.pageId;
            try {
                ajax({
                    url: 'https://graph.facebook.com/' + url, //TODO: use recent Graph API endpoint format (versioned) https://developers.facebook.com/docs/graph-api/reference/v2.7/url
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    var count = resp.share && resp.share.share_count || 0;
                    counts.facebook = count;
                    addToShareCount(count);
                    updateTooltip();
                });
            } catch (e) {
                reportError(new Error('Error retrieving share counts (' + e.message + ')'), {
                    feature: 'share-count'
                }, false);
            }
        }
    };
});
