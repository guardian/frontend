define([
    'common/utils/report-error',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/formatters',
    'common/views/svgs',
    'tpl!common/views/content/share-count.html',
    'tpl!common/views/content/share-count-immersive.html'
], function (
    reportError,
    $,
    ajax,
    detect,
    config,
    formatters,
    svgs,
    shareCountTemplate,
    shareCountImmersiveTemplate
) {
    var shareCount = 0,
        $shareCountEls = $('.js-sharecount'),
        $fullValueEls,
        $shortValueEls,
        counts = {
            facebook: 'n/a'
        };

    function incrementShareCount(amount) {
        if (amount !== 0) {
            shareCount += amount;
            var displayCount = shareCount.toFixed(0),
                formattedDisplayCount = formatters.integerCommas(displayCount),
                shortDisplayCount = displayCount > 10000 ? Math.round(displayCount / 1000) + 'k' : displayCount;
            $fullValueEls.text(formattedDisplayCount);
            $shortValueEls.text(shortDisplayCount);
        }
    }

    function updateTooltip() {
        $shareCountEls.attr('title', 'Facebook: ' + counts.facebook);
    }

    function addToShareCount(val) {
        var html = $shareCountEls.hasClass('js-sharecount-immersive') ?
            shareCountImmersiveTemplate({ icon: svgs('share') }) :
            shareCountTemplate({ icon: svgs('share') });

        $shareCountEls
            .removeClass('u-h')
            .html(html)
            .css('display', '');

        $shortValueEls = $('.sharecount__value--short', $shareCountEls[0]); // limited to 1 el
        $fullValueEls = $('.sharecount__value--full', $shareCountEls[0]); // limited to 1 el

        if (detect.isBreakpoint({min: 'tablet'})) {
            var duration = 250,
                updateStep = 25,
                slices = duration / updateStep,
                amountPerStep = val / slices,
                currentSlice = 0,
                interval = window.setInterval(function () {
                    incrementShareCount(amountPerStep);
                    if (++currentSlice === slices) {
                        window.clearInterval(interval);
                    }
                }, updateStep);
        } else {
            incrementShareCount(val);
        }
    }

    return function () {
        // asking for social counts in preview "leaks" upcoming URLs to social sites.
        // when they then crawl them they get 404s which affects later sharing.
        // don't call counts in preview
        if ($shareCountEls.length && !config.page.isPreview) {
            var url = 'http://www.theguardian.com/' + config.page.pageId;
            try {
                ajax({
                    url: 'https://graph.facebook.com/' + url,
                    type: 'json',
                    method: 'get',
                    crossOrigin: true
                }).then(function (resp) {
                    var count = resp.shares || 0;
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
