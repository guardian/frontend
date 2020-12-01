/** Bootstrap for functionality common to articles and live blogs */
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import { enhanceTweets, init as initT } from 'common/modules/article/twitter';
import { lastModified } from 'common/modules/ui/last-modified';
import { init as selectionSharingInit } from 'common/modules/ui/selection-sharing';
import fence from 'fence';
import $ from 'lib/$';
import { catchErrorsWithContext } from 'lib/robust';

const initFence = (): void => {
    $('.fenced').each(fence.render);
};

const initTwitter = (): void => {
    initT();
    enhanceTweets();
};

const init = (): void => {
    catchErrorsWithContext([
        ['trail-a11y', shouldHideFlashingElements],
        ['trail-fence', initFence],
        ['trail-twitter', initTwitter],
        ['trail-sharing', selectionSharingInit],
        ['trail-last-modified', lastModified],
    ]);
};

export { init };
