define([
    'fastdom',
    'lib/report-error',
    'lib/$',
    'lib/fetch-json',
    'lib/detect',
    'lib/config',
    'lib/formatters',
    'lodash/utilities/template',
    'common/views/svgs',
    'raw-loader!common/views/content/share-count.html',
    'raw-loader!common/views/content/share-count-immersive.html'
], function (
    fastdom,
    reportError,
    $,
    fetchJSON,
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
        var endpoint = config.page.ajaxUrl + '/sharecount/' + config.page.pageId + '.json';

        fetchJSON(endpoint, {
            type: 'json',
            mode: 'cors',
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
