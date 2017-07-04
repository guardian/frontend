/** Bootstrap for functionality common to articles and live blogs */
import fence from 'fence';
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import robust from 'lib/robust';
import accessibility from 'common/modules/accessibility/helpers';
import twitter from 'common/modules/article/twitter';
import OpenCta from 'common/modules/open/cta';
import lastModified from 'common/modules/ui/last-modified';
import rhc from 'common/modules/ui/rhc';
import selectionSharing from 'common/modules/ui/selection-sharing';

function initOpenCta() {
    if (config.switches.openCta && config.page.commentable) {
        var openCta = new OpenCta(mediator, {
            discussionKey: config.page.shortUrlId || ''
        });

        $.create('<div class="open-cta"></div>').each(function(el) {
            openCta.fetch(el);
            if (!config.page.isLiveBlog && !config.page.isMinuteArticle) {
                rhc.addComponent(el);
            }
        });
    }
}

function initFence() {
    $('.fenced').each(function(el) {
        fence.render(el);
    });
}

function initTwitter() {
    twitter.init();
    twitter.enhanceTweets();
}

export default function() {
    robust.catchErrorsWithContext([
        ['trail-a11y', accessibility.shouldHideFlashingElements],
        ['trail-article', initOpenCta],
        ['trail-fence', initFence],
        ['trail-twitter', initTwitter],
        ['trail-sharing', selectionSharing.init],
        ['trail-last-modified', lastModified]
    ]);
};
