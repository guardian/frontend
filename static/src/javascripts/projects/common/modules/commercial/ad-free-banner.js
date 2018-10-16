// @flow
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';
import checkIcon from 'svgs/icon/tick.svg';
import bean from 'bean';

const messageCode = 'ad-free-banner';
const image =
    'https://media.guim.co.uk/6202ea352e93505f8096bfe3adb0cd2b3b80a5ed/0_0_1395_935/master/1395.png';

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
        <div class="site-message__copy-text">
            <h2 class="site-message__copy-heading">Title for this banner</h2>
            <p>An action is needed on your Guardian account. 
            Please review and update your details as soon as you can. Thank you.</p>
            <button class="button site-message__copy-button js-mma-update-details-button">
                ${checkIcon.markup} Update details 
            </button>
        </div>
        <div class="site-message__image">
            <img src="${image}" alt="" />
        </div>
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
