// @flow

import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import config from 'lib/config';
import type { Banner } from 'common/modules/ui/bannerPicker';

const messageCode: string = 'email-sign-in-banner';

const signInLink = `${config.get(
    'page.idUrl'
)}/login?returnUrl=https://theguardian.com/email-newsletters`;

const isInExperiment = (): boolean =>
    config.get('switches.idEmailSignInUpsell');

const canShow: () => Promise<boolean> = () =>
    Promise.resolve(
        !hasUserAcknowledgedBanner(messageCode) && isInExperiment()
    );

const show: () => void = () => {
    const message = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
    });
    message.show(
        `Enjoying this newsletter? <a href="${signInLink}">Sign in</a> to get more.`
    );
};

export const emailSignInBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};
