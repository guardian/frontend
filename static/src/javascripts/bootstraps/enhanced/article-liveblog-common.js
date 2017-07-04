// @flow
/** Bootstrap for functionality common to articles and live blogs */
import fence from 'fence';
import $ from 'lib/$';
import config from 'lib/config';
import mediator from 'lib/mediator';
import { catchErrorsWithContext } from 'lib/robust';
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import twitter from 'common/modules/article/twitter';
import OpenCta from 'common/modules/open/cta';
import lastModified from 'common/modules/ui/last-modified';
import { addComponent } from 'common/modules/ui/rhc';
import selectionSharing from 'common/modules/ui/selection-sharing';

const initOpenCta = (): void => {
    if (config.switches.openCta && config.page.commentable) {
        const openCta = new OpenCta(mediator, {
            discussionKey: config.page.shortUrlId || '',
        });

        $.create('<div class="open-cta"></div>').each(el => {
            openCta.fetch(el);
            if (!config.page.isLiveBlog && !config.page.isMinuteArticle) {
                addComponent(el);
            }
        });
    }
};

const initFence = (): void => {
    $('.fenced').each(el => {
        fence.render(el);
    });
};

const initTwitter = (): void => {
    twitter.init();
    twitter.enhanceTweets();
};

const init = (): void => {
    catchErrorsWithContext([
        ['trail-a11y', shouldHideFlashingElements],
        ['trail-article', initOpenCta],
        ['trail-fence', initFence],
        ['trail-twitter', initTwitter],
        ['trail-sharing', selectionSharing.init],
        ['trail-last-modified', lastModified],
    ]);
};

export { init };
