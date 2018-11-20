// @flow
import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import checkIcon from 'svgs/icon/tick.svg';
import bean from 'bean';
import config from 'lib/config';
import { isAdFreeUser } from 'common/modules/commercial/user-features';

const messageCode = 'ad-free-banner';
const image = config.get('images.acquisitions.ad-free', '');

const isInExperiment = (): boolean =>
    config.get('switches.scAdFreeBanner', false);

const hideBanner = (banner: Message) => {
    banner.acknowledge();
};

const canShow: () => Promise<boolean> = () =>
    Promise.resolve(
        !hasUserAcknowledgedBanner(messageCode) &&
            isAdFreeUser() &&
            isInExperiment()
    );

const show = (): Promise<boolean> => {
    new Message(messageCode, {
        siteMessageLinkName: messageCode,
        siteMessageCloseBtn: 'hide',
        trackDisplay: true,
        cssModifierClass: messageCode,
        customJs() {
            bean.on(
                document,
                'click',
                '.js-ad-free-banner-dismiss-button',
                () => hideBanner(this)
            );
        },
    }).show(`
        <div class="site-message__copy-text">
            <h2 class="site-message__copy-heading">No ads, no interruptions</h2>
            <p>As a valued subscriber, you won’t see adverts while logged in to the Guardian. Thank you for your support.</p>
            <button data-link-name="ad-free-banner : dismiss" class="button site-message__copy-button js-ad-free-banner-dismiss-button">
                ${checkIcon.markup} Got it, thanks
            </button>
        </div>
        <div class="site-message__image">
            <img src="${image}" alt="" />
        </div>
    `);
    return Promise.resolve(true);
};

const adFreeBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export { adFreeBanner };
