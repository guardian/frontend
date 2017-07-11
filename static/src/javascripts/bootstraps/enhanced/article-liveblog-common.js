// @flow
/** Bootstrap for functionality common to articles and live blogs */
import fence from 'fence';
import $ from 'lib/$';
import { catchErrorsWithContext } from 'lib/robust';
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import twitter from 'common/modules/article/twitter';
import lastModified from 'common/modules/ui/last-modified';
import selectionSharing from 'common/modules/ui/selection-sharing';

const initFence = (): void => {
    $('.fenced').each(fence.render);
};

const initTwitter = (): void => {
    twitter.init();
    twitter.enhanceTweets();
};

const init = (): void => {
    catchErrorsWithContext([
        ['trail-a11y', shouldHideFlashingElements],
        ['trail-fence', initFence],
        ['trail-twitter', initTwitter],
        ['trail-sharing', selectionSharing.init],
        ['trail-last-modified', lastModified],
    ]);
};

export { init };
