/*global twttr:false */

define([
    'qwery',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/config'
], function(
    qwery,
    $,
    detect,
    config
) {
    function enhanceTweets() {

        if (detect.getBreakpoint() === 'mobile' || !config.switches.enhanceTweets) {
            return;
        }

        var tweetElements = qwery('blockquote.tweet'),
            widgetScript  = qwery('#twitter-widget');

        tweetElements.forEach( function(element) {
            // Reformat the tweet element to match twitter's native element structure.
            $('.tweet-body', element).after($('.tweet-date', element));
            $('.tweet-user', element).remove();
            $(element).removeClass('tweet').addClass('twitter-tweet');
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
                if (twttr && 'widgets' in twttr && 'load' in twttr.widgets) {
                    twttr.widgets.load();
                }
            }
        }
    }

    return {
        enhanceTweets: enhanceTweets
    };
});
