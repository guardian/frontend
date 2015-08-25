/*global twttr:false */

define([
    'bean',
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    qwery,
    fastdom,
    _,
    $,
    config,
    detect,
    mediator
) {
    var body = qwery('.js-liveblog-body'),
        fallbackImagesCleared = false;

    function dontEnhanceBreakpoint() {
        return detect.getBreakpoint() === 'mobile';
    }

    // while not pretty, this is necessary for when you change breakpoints
    // (i.e. stretch the browser and then narrow it again).
    function clearFallbackImages() {
        if (!fallbackImagesCleared) {
            qwery('.js-tweet-main-image').forEach(function (image) {
                fastdom.write(function () {
                    $(image).remove();
                });
            });
            fallbackImagesCleared = true;
        }
    }

    function bootstrap() {
        mediator.on('window:throttledScroll', _.debounce(enhanceTweets, 200));
    }

    function enhanceTweets() {
        if (dontEnhanceBreakpoint() || !config.switches.enhanceTweets) {
            return;
        }

        var scriptElement,
            tweetElements       = qwery('blockquote.js-tweet'),
            widgetScript        = qwery('#twitter-widget'),
            viewportHeight      = bonzo.viewport().height,
            nativeTweetElements = qwery('blockquote.twitter-tweet'),
            scrollTop           = window.pageYOffset;

        clearFallbackImages();

        tweetElements.forEach(function (element) {
            var $el = bonzo(element),
                elOffset = $el.offset();
            if (((scrollTop + (viewportHeight * 2.5)) > elOffset.top) && (scrollTop < (elOffset.top + elOffset.height))) {
                fastdom.write(function () {
                    $(element).removeClass('js-tweet').addClass('twitter-tweet');
                });
            }
        });

        if (nativeTweetElements.length > 0) {
            if (widgetScript.length === 0) {
                scriptElement = document.createElement('script');
                scriptElement.id = 'twitter-widget';
                scriptElement.async = true;
                scriptElement.src = '//platform.twitter.com/widgets.js';
                $(document.body).append(scriptElement);
            } else {
                if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
                    twttr.widgets.load(body);
                }
            }
        }
    }

    return {
        init: bootstrap,
        enhanceTweets: enhanceTweets
    };
});
