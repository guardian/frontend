import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { upgradeRichLinks } from 'common/modules/article/rich-links';
import { Affix } from 'common/modules/experiments/affix';
import { autoUpdate } from 'common/modules/ui/autoupdate';
import { init as initRelativeDates } from 'common/modules/ui/relativedates';
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import { initTrails } from 'bootstraps/enhanced/trail';
import { catchErrorsWithContext } from 'lib/robust';

const affixTimeline = () => {
    const keywordIds = config.get('page.keywordIds', '');

    if (
        isBreakpoint({
            min: 'desktop',
        }) &&
        !keywordIds.includes('football/football') &&
        !keywordIds.includes('sport/rugby-union')
    ) {
        // eslint-disable-next-line no-new
        new Affix({
            element: document.querySelector(
                '.js-live-blog__sticky-components-container'
            ),
            topMarker: document.querySelector('.js-top-marker'),
            bottomMarker: document.querySelector('.js-bottom-marker'),
            containerElement: document.querySelector(
                '.js-live-blog__sticky-components'
            ),
        });
    }
};

const createAutoUpdate = () => {
    if (config.get('page.isLive')) {
        autoUpdate();
    }
};

const keepTimestampsCurrent = () => {
    window.setInterval(() => initRelativeDates(), 60000);
};

const init = () => {
    catchErrorsWithContext([
        ['lb-autoupdate', createAutoUpdate],
        ['lb-timeline', affixTimeline],
        ['lb-timestamp', keepTimestampsCurrent],
        ['lb-richlinks', upgradeRichLinks],
    ]);

    initTrails();
    initLiveblogCommon();

    catchErrorsWithContext([
        [
            'lb-ready',
            () => {
                mediator.emit('page:liveblog:ready');
            },
        ],
    ]);
};

export { init };
