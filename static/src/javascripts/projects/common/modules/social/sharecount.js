define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'text!common/views/content/share-count.html'
], function(
    $,
    ajax,
    detect,
    config,
    sharecountTemplate
) {

    var shareCount    = 0,
        $shareCountEls = $('.js-sharecount'),
        $fullValueEls,
        $shortValueEls;

    function incrementShareCount(amount) {
        if (amount !== 0) {
            shareCount += amount;
            var displayCount = shareCount.toFixed(0),
                shortDisplayCount = displayCount > 10000 ? Math.round(displayCount / 1000) + 'k' : displayCount;
            $fullValueEls.text(displayCount);
            $shortValueEls.text(shortDisplayCount);
        }
    }

    function addToShareCount(val) {

        $shareCountEls.each(function(el){
            $shareCountEls
                .html(sharecountTemplate)
                .css('display', '');

            $shortValueEls = $('.sharecount__value--short', $shareCountEls[0]); // limited to 1 el
            $fullValueEls = $('.sharecount__value--full', $shareCountEls[0]); // limited to 1 el
        });

        if (detect.isBreakpoint({min: 'tablet'})) {
            var duration = 500,
                updateStep = 25,
                slices     = duration / updateStep,
                amountPerStep = val / slices,
                currentSlice = 0,
                interval = window.setInterval(function() {
                    incrementShareCount(amountPerStep);
                    if (++currentSlice === slices) {
                        window.clearInterval(interval);
                    }
                }, updateStep);
        } else {
            incrementShareCount(val);
        }

    }

    function init() {
        if ($shareCountEls.length) {
            var url = "http://www.theguardian.com/" + config.page.pageId;
            ajax({
                url: 'http://graph.facebook.com/' + url,
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function(resp) {
                    addToShareCount(resp.shares);
                }
            });
            ajax({
                url: 'http://urls.api.twitter.com/1/urls/count.json?url=' + url,
                type: 'jsonp',
                method: 'get',
                crossOrigin: true,
                success: function(resp) {
                    addToShareCount(resp.count);
                }
            });
        }

    }

    return {
        init: init
    }
});