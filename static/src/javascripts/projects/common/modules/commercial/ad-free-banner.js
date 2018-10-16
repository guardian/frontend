// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
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
    }).show('test');
    return Promise.resolve(true);
};

const canShow = (): Promise<boolean> => Promise.resolve(true);

const adFreeBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export { adFreeBanner };
