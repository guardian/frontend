/*global twttr:false */

import bonzo from 'bonzo';
import qwery from 'qwery';
import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import debounce from 'lodash/functions/debounce';
var body = qwery('.js-liveblog-body, .js-article__body, .js-article__body--minute-article');

function bootstrap() {
    mediator.on('window:throttledScroll', debounce(enhanceTweets, 200));
}

function enhanceTweets() {
    if ((detect.getBreakpoint() === 'mobile' && !config.page.isMinuteArticle) || !config.switches.enhanceTweets) {
        return;
    }

    var tweetElements = qwery('blockquote.js-tweet'),
        viewportHeight = bonzo.viewport().height,
        scrollTop = window.pageYOffset;

    tweetElements.forEach(function(element) {
        var $el = bonzo(element),
            elOffset = $el.offset();
        if (((scrollTop + (viewportHeight * 2.5)) > elOffset.top) && (scrollTop < (elOffset.top + elOffset.height))) {
            fastdom.write(function() {
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

export default {
    init: bootstrap,
    enhanceTweets: enhanceTweets
};
