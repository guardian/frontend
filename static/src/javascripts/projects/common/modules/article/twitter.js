/*global twttr:false */

define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    bonzo,
    qwery,
    _,
    $,
    config,
    detect,
    mediator
) {
    var body = qwery('.js-liveblog-body');

    function bootstrap() {
        mediator.on('window:throttledScroll', enhanceTweets);
    }

    function enhanceTweets(scrollY) {
        if (detect.getBreakpoint() === 'mobile' || !config.switches.enhanceTweets) {
            return;
        }

        var scriptElement,
            tweetElements       = qwery('blockquote.js-tweet'),
            widgetScript        = qwery('#twitter-widget'),
            viewportHeight      = bonzo.viewport().height,
            nativeTweetElements = qwery('blockquote.twitter-tweet');

        tweetElements.forEach(function (element) {
            var $el = bonzo(element);
            if (((scrollY + (viewportHeight * 2.5)) > $el.offset().top) && (scrollY < ($el.offset().top + $el.offset().height))) {
                $(element).removeClass('js-tweet').addClass('twitter-tweet');
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
