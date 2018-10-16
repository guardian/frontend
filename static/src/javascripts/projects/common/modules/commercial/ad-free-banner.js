// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import checkIcon from 'svgs/icon/tick.svg';
import bean from 'bean';

const messageCode = 'ad-free-banner';

const hideBanner = (banner: Message) => {
    banner.hide();
};

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
        <span class="site-message__copy-text">
            An action is needed on your Guardian account. 
            Please review and update your details as soon as you can. Thank you.
        </span>
        <button class="button site-message__copy-button js-mma-update-details-button">
            ${checkIcon.markup} Update details 
        </button>
    `);
    return Promise.resolve(true);
};

const canShow = (): Promise<boolean> => Promise.resolve(true);

const adFreeBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export { adFreeBanner };
