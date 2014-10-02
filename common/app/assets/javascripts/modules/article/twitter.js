/*global twttr:false */

define([
    'bean',
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function(
    bean,
    bonzo,
    qwery,
    forEach,
    $,
    config,
    detect,
    mediator
) {
    var body = qwery('.js-liveblog-body');

    function bootstrap() {
        mediator.on('window:scroll', enhanceTweets);
    }

    function enhanceTweets() {
        if (detect.getBreakpoint() === 'mobile' || !config.switches.enhanceTweets) {
            return;
        }

        var tweetElements = qwery('blockquote.js-tweet'),
            widgetScript  = qwery('#twitter-widget'),
            viewportHeight = bonzo.viewport().height;

        tweetElements.forEach( function(element) {
            var $el = bonzo(element);
            if(((bonzo(document.body).scrollTop() + (viewportHeight * 2.5)) > $el.offset().top) && (bonzo(document.body).scrollTop() < ($el.offset().top + $el.offset().height))) {
                $(element).removeClass('js-tweet').addClass('twitter-tweet');
            }
        });

        var nativeTweetElements = qwery('blockquote.twitter-tweet');

        if (nativeTweetElements.length > 0) {
            if (widgetScript.length === 0) {
                var scriptElement = document.createElement('script');
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
