/** Bootstrap for functionality common to articles and live blogs */
import fence from 'fence';
import $ from 'lib/$';
import { catchErrorsWithContext } from 'lib/robust';
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import { init as initT, enhanceTweets } from 'common/modules/article/twitter';
import { lastModified } from 'common/modules/ui/last-modified';
import { init as selectionSharingInit } from 'common/modules/ui/selection-sharing';

const initFence = () => {
    $('.fenced').each(fence.render);
};

const initTwitter = () => {
    initT();
    enhanceTweets();
};

const init = () => {
    catchErrorsWithContext([
        ['trail-a11y', shouldHideFlashingElements],
        ['trail-fence', initFence],
        ['trail-twitter', initTwitter],
        ['trail-sharing', selectionSharingInit],
        ['trail-last-modified', lastModified],
    ]);
};

export { init };
