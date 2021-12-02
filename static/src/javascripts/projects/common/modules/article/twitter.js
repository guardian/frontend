/* global twttr: false */

import fastdom from 'fastdom';
import config from 'lib/config';
import { getBreakpoint, getViewport } from 'lib/detect';
import { mediator } from 'lib/mediator';
import debounce from 'lodash/debounce';

const body = document.querySelector(
    '.js-liveblog-body, .js-article__body, .js-article__body--minute-article'
);

const renderTweets = () => {
    const nativeTweetElements = Array.from(
        document.querySelectorAll('blockquote.twitter-tweet')
    );
    const widgetScript = document.getElementById('twitter-widget');

    if (nativeTweetElements.length) {
        if (!widgetScript) {
            const scriptElement = document.createElement('script');
            const target = document.scripts[0];

            scriptElement.id = 'twitter-widget';
            scriptElement.async = true;
            scriptElement.src = '//platform.twitter.com/widgets.js';

            if (target && target.parentNode) {
                target.parentNode.insertBefore(scriptElement, target);
            }
        }

        if (
            typeof twttr !== 'undefined' &&
            twttr.widgets &&
            twttr.widgets.load
        ) {
            twttr.widgets.load(body);
        }
    }
};

const enhanceTweets = () => {
    if (
        (getBreakpoint() === 'mobile' && !config.get('page.isMinuteArticle')) ||
        !config.get('switches.enhanceTweets')
    ) {
        return;
    }

    const tweetElements = Array.from(
        document.querySelectorAll('blockquote.js-tweet')
    );
    const viewportHeight = getViewport().height;

    tweetElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (viewportHeight * 2.5 > rect.top && rect.top + rect.height > 0) {
            fastdom.mutate(() => {
                element.classList.remove('js-tweet');
                element.classList.add('twitter-tweet');
                // We only want to render tweets once the class has been added
                renderTweets();
            });
        }
    });
};

const init = () => {
    mediator.on('window:throttledScroll', debounce(enhanceTweets, 200));
};

export { init, enhanceTweets };
