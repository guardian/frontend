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

    function bootstrap() {
        mediator.on('window:scroll', enhanceTweets);
    }

    function enhanceTweets() {
    console.log("scroll: " + bonzo(document.body).scrollTop())
        if (detect.getBreakpoint() === 'mobile' || !config.switches.enhanceTweets) {
            return;
        }

        var tweetElements = qwery('blockquote.tweet'),
            widgetScript  = qwery('#twitter-widget'),
            viewportHeight = bonzo.viewport().height;

        tweetElements.forEach( function(element) {
            var $el = bonzo(element);
            if((bonzo(document.body).scrollTop() + (viewportHeight*2)) > $el.offset().top) {
                console.log("Upgrade! Element at position:" + $el.offset().top + " / " + $el.offset().top);
                // Reformat the tweet element to match twitter's native element structure.
                $('.tweet-body', element).after($('.tweet-date', element));
                $('.tweet-user', element).remove();
                $(element).removeClass('tweet').addClass('twitter-tweet');
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
                    twttr.widgets.load();
                }
            }
        }
    }

    return {
        init: bootstrap,
        enhanceTweets: enhanceTweets
    };
});
