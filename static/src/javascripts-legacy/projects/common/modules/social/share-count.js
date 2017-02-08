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

    function fetch() {
        ajax({
            url: config.page.ajaxUrl + '/sharecount/' + config.page.pageId + '.json',
            type: 'json',
            method: 'get',
            crossOrigin: true
        }).then(function (resp) {
            var count = resp.share_count || 0;
            counts.facebook = count;
            addToShareCount(count);
            updateTooltip();
        });
    }

    return function () {
        // asking for social counts in preview "leaks" upcoming URLs to social sites.
        // when they then crawl them they get 404s which affects later sharing.
        // don't call counts in preview
        if (config.switches.serverShareCounts && $shareCountEls.length && !config.page.isPreview) {
            try {
                fetch()
            } catch (e) {
                reportError(new Error('Error retrieving share counts (' + e.message + ')'), {
                    feature: 'share-count'
                }, false);
            }
        }
    };
});
