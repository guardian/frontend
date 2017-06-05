// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import richLinks from 'common/modules/article/rich-links';
import Affix from 'common/modules/experiments/affix';
import AutoUpdate from 'common/modules/ui/autoupdate';
import RelativeDates from 'common/modules/ui/relativedates';
import articleLiveblogCommon from 'bootstraps/enhanced/article-liveblog-common';
import trail from 'bootstraps/enhanced/trail';
import notifications from 'bootstraps/enhanced/notifications';
import { catchErrorsWithContext } from 'lib/robust';

const affixTimeline = (): void => {
    if (
        detect.isBreakpoint({
            min: 'desktop',
        }) &&
        !config.page.keywordIds.includes('football/football') &&
        !config.page.keywordIds.includes('sport/rugby-union')
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

const createAutoUpdate = (): void => {
    if (config.page.isLive) {
        AutoUpdate();
    }
};

const keepTimestampsCurrent = (): void => {
    const dates = RelativeDates;

    window.setInterval(() => {
        dates.init();
    }, 60000);
};

const notificationsCondition = (): boolean =>
    config.switches.liveBlogChromeNotificationsProd &&
    !detect.isIOS() &&
    (window.location.protocol === 'https:' ||
        window.location.hash === '#force-sw') &&
    detect.getUserAgent.browser === 'Chrome' &&
    config.page.isLive;

const initNotifications = (): void => {
    if (notificationsCondition()) {
        notifications.init();
    }
};

const init = (): void => {
    catchErrorsWithContext([
        ['lb-autoupdate', createAutoUpdate],
        ['lb-timeline', affixTimeline],
        ['lb-timestamp', keepTimestampsCurrent],
        ['lb-notifications', initNotifications],
        ['lb-richlinks', richLinks.upgradeRichLinks],
    ]);

    trail();
    articleLiveblogCommon();

    catchErrorsWithContext([
        [
            'lb-ready',
            () => {
                mediator.emit('page:liveblog:ready');
            },
        ],
    ]);
};

export { init, notificationsCondition };
