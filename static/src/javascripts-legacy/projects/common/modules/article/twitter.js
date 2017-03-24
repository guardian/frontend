/*global twttr:false */

define([
    'bonzo',
    'qwery',
    'fastdom',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lodash/functions/debounce'
], function (
    bonzo,
    qwery,
    fastdom,
    $,
    config,
    detect,
    mediator,
    debounce
) {
    var body = qwery('.js-liveblog-body, .js-article__body, .js-article__body--minute-article');

    function bootstrap() {
        mediator.on('window:throttledScroll', debounce(enhanceTweets, 200));
    }

    function enhanceTweets() {
        if ((detect.getBreakpoint() === 'mobile' && !config.page.isMinuteArticle) || !config.switches.enhanceTweets) {
            return;
        }

        var tweetElements       = qwery('blockquote.js-tweet'),
            viewportHeight      = bonzo.viewport().height,
            scrollTop           = window.pageYOffset;

        tweetElements.forEach(function (element) {
            var $el = bonzo(element),
                elOffset = $el.offset();
            if (((scrollTop + (viewportHeight * 2.5)) > elOffset.top) && (scrollTop < (elOffset.top + elOffset.height))) {
                fastdom.write(function () {
                    $(element).removeClass('js-tweet').addClass('twitter-tweet');
                    // We only want to render tweets once the class has been added
                    renderTweets();
                });
            }
        });
    }

    function renderTweets() {
        var scriptElement,
            nativeTweetElements = qwery('blockquote.twitter-tweet'),
            widgetScript = qwery('#twitter-widget');

        if (nativeTweetElements.length > 0) {
            if (widgetScript.length === 0) {
                scriptElement = document.createElement('script');
                scriptElement.id = 'twitter-widget';
                scriptElement.async = true;
                scriptElement.src = '//platform.twitter.com/widgets.js';
                $(document.body).append(scriptElement);
            }

            if (typeof twttr !== 'undefined' && 'widgets' in twttr && 'load' in twttr.widgets) {
                twttr.widgets.load(body);
            }
        }
    }

    return {
        init: bootstrap,
        enhanceTweets: enhanceTweets
    };
});
